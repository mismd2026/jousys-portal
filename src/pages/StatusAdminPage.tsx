import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  INCIDENT_TYPES,
  LEVELS,
  LOCATION_GROUPS,
  LOCATIONS,
  type IncidentTypeId,
  type LevelId,
  type StatusMap,
  cellKey,
  getCell,
  levelById,
} from '../domain/status';
import { statusRepository, type PublishLog } from '../lib/statusRepository';
import { csvToStatus, decodeCsvBytes, downloadText, statusToCsv } from '../lib/csv';
import { formatDateTime, timestampForFile } from '../lib/format';
import LevelLegend from '../components/LevelLegend';

type Notice = { kind: 'ok' | 'warn' | 'error'; text: string; details?: string[] };

const ALL_KEYS = LOCATIONS.flatMap((l) => INCIDENT_TYPES.map((t) => cellKey(l.id, t.id)));
const SOURCE_LABEL: Record<PublishLog['source'], string> = {
  checkbox: 'チェックボックス',
  csv: 'CSV取り込み',
  reset: '全て正常に戻す',
};

export default function StatusAdminPage() {
  const [published, setPublished] = useState<StatusMap | null>(null);
  const [draft, setDraft] = useState<StatusMap>({});
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [level, setLevel] = useState<LevelId>('emergency');
  const [message, setMessage] = useState('');
  const [operator, setOperator] = useState('情シス 担当者');
  const [draftSource, setDraftSource] = useState<PublishLog['source']>('checkbox');
  const [notice, setNotice] = useState<Notice | null>(null);
  const [history, setHistory] = useState<PublishLog[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    statusRepository.load().then((s) => {
      setPublished(s.cells);
      setDraft(s.cells);
    });
    statusRepository.history().then(setHistory);
  }, []);

  if (!published) return <p className="muted">読み込み中…</p>;

  // ---- 選択操作 ----
  const toggle = (keys: string[]) =>
    setSelected((prev) => {
      const next = new Set(prev);
      const allOn = keys.every((k) => next.has(k));
      keys.forEach((k) => (allOn ? next.delete(k) : next.add(k)));
      return next;
    });
  const stateOf = (keys: string[]) => {
    const n = keys.filter((k) => selected.has(k)).length;
    return { checked: n === keys.length && n > 0, indeterminate: n > 0 && n < keys.length };
  };
  const columnKeys = (t: IncidentTypeId, locIds = LOCATIONS.map((l) => l.id)) =>
    locIds.map((id) => cellKey(id, t));
  const rowKeys = (locId: string) => INCIDENT_TYPES.map((t) => cellKey(locId, t.id));

  // ---- 下書きへの反映 ----
  const applyToSelected = () => {
    if (selected.size === 0) {
      setNotice({ kind: 'warn', text: '反映する箇所にチェックを入れてください。' });
      return;
    }
    const now = new Date().toISOString();
    setDraft((prev) => {
      const next = { ...prev };
      selected.forEach((k) => {
        if (level === 'normal') delete next[k];
        else next[k] = { level, message: message.trim(), updatedAt: now };
      });
      return next;
    });
    setDraftSource('checkbox');
    setNotice({
      kind: 'ok',
      text: `${selected.size} 箇所を「${levelById(level).name}」にしました（未送信）。`,
    });
    setSelected(new Set());
  };

  const resetAll = () => {
    setDraft({});
    setDraftSource('reset');
    setNotice({ kind: 'ok', text: 'すべての箇所を「正常」にしました（未送信）。' });
  };

  const discard = () => {
    setDraft(published);
    setSelected(new Set());
    setNotice({ kind: 'ok', text: '未送信の変更を破棄しました。' });
  };

  // ---- DB 送信 ----
  const publish = async () => {
    const snap = await statusRepository.publish(draft, operator.trim() || '情シス', draftSource);
    setPublished(snap.cells);
    setDraft(snap.cells);
    setHistory(await statusRepository.history());
    setNotice({
      kind: 'ok',
      text: `DB へ送信しました（${formatDateTime(snap.publishedAt)}）。掲示板に反映されています。`,
    });
  };

  // ---- CSV ----
  const exportCsv = () => {
    downloadText(`status_${timestampForFile()}.csv`, statusToCsv(draft));
    setNotice({ kind: 'ok', text: '現在の内容（未送信の変更を含む）を CSV に出力しました。' });
  };
  const exportTemplate = () => {
    downloadText('status_template.csv', statusToCsv({}));
  };
  const importCsv = async (file: File) => {
    const text = decodeCsvBytes(await file.arrayBuffer());
    const r = csvToStatus(text);
    if (r.rowCount === 0) {
      setNotice({ kind: 'error', text: `「${file.name}」を取り込めませんでした。`, details: r.errors });
      return;
    }
    setDraft(r.cells);
    setDraftSource('csv');
    setSelected(new Set());
    setNotice({
      kind: r.errors.length ? 'warn' : 'ok',
      text: `「${file.name}」から ${r.rowCount} 行を取り込みました（障害 ${Object.keys(r.cells).length} 件）。内容を確認して「DBへ送信」してください。`,
      details: r.errors,
    });
  };

  const changedKeys = new Set(
    ALL_KEYS.filter((k) => {
      const a = draft[k];
      const b = published[k];
      return (a?.level ?? 'normal') !== (b?.level ?? 'normal') || (a?.message ?? '') !== (b?.message ?? '');
    }),
  );
  const dirty = changedKeys.size > 0;

  return (
    <div className="stack-lg">
      <div className="page-head">
        <div>
          <p className="crumb">
            <Link to="/status">障害通知掲示板</Link> ／ 更新画面
          </p>
          <h1>障害ステータス更新（情シス用）</h1>
          <p className="muted">
            ① 障害箇所にチェック → ② レベルとメッセージを選んで「反映」 → ③「DBへ送信」で掲示板に公開されます。
            CSV を編集して取り込むこともできます。
          </p>
        </div>
      </div>

      {notice && (
        <div className={`notice notice-${notice.kind}`} role="status">
          <div className="notice-row">
            <span>{notice.text}</span>
            <button className="link-btn" onClick={() => setNotice(null)} aria-label="閉じる">
              ×
            </button>
          </div>
          {notice.details && notice.details.length > 0 && (
            <ul className="notice-details">
              {notice.details.slice(0, 10).map((d) => (
                <li key={d}>{d}</li>
              ))}
              {notice.details.length > 10 && <li>ほか {notice.details.length - 10} 件</li>}
            </ul>
          )}
        </div>
      )}

      <div className="admin-layout">
        {/* ---- チェックボックス マトリクス ---- */}
        <section className="card matrix-card">
          <div className="toolbar">
            <h2>① 障害箇所を選択</h2>
            <div className="toolbar-actions">
              <span className="muted small">{selected.size} 箇所選択中</span>
              <button className="btn btn-sm btn-ghost" onClick={() => setSelected(new Set())}>
                選択解除
              </button>
            </div>
          </div>
          <LevelLegend />
          <div className="matrix-scroll">
            <table className="matrix">
              <thead>
                <tr>
                  <th className="matrix-loc">
                    <label className="cb">
                      <CheckBox {...stateOf(ALL_KEYS)} onChange={() => toggle(ALL_KEYS)} />
                      拠点 ＼ 障害種別
                    </label>
                  </th>
                  {INCIDENT_TYPES.map((t) => (
                    <th key={t.id}>
                      <label className="cb">
                        <CheckBox {...stateOf(columnKeys(t.id))} onChange={() => toggle(columnKeys(t.id))} />
                        {t.name}
                      </label>
                    </th>
                  ))}
                </tr>
              </thead>
              {LOCATION_GROUPS.map((g) => {
                const locs = LOCATIONS.filter((l) => l.group === g.id);
                const groupKeys = locs.flatMap((l) => rowKeys(l.id));
                return (
                  <tbody key={g.id}>
                    <tr className="matrix-group">
                      <th colSpan={1 + INCIDENT_TYPES.length}>
                        <label className="cb">
                          <CheckBox {...stateOf(groupKeys)} onChange={() => toggle(groupKeys)} />
                          {g.name}（{locs.length}）
                        </label>
                      </th>
                    </tr>
                    {locs.map((loc) => (
                      <tr key={loc.id}>
                        <th className="matrix-loc">
                          <label className="cb">
                            <CheckBox {...stateOf(rowKeys(loc.id))} onChange={() => toggle(rowKeys(loc.id))} />
                            {loc.name}
                          </label>
                        </th>
                        {INCIDENT_TYPES.map((t) => {
                          const k = cellKey(loc.id, t.id);
                          const c = getCell(draft, loc.id, t.id);
                          return (
                            <td
                              key={t.id}
                              className={`matrix-cell lv-${c.level} ${selected.has(k) ? 'is-selected' : ''} ${changedKeys.has(k) ? 'is-changed' : ''}`}
                            >
                              <label className="cb cell-label" title={c.message}>
                                <input
                                  type="checkbox"
                                  checked={selected.has(k)}
                                  onChange={() => toggle([k])}
                                  aria-label={`${loc.name} ${t.name}`}
                                />
                                <span className="cell-level">{levelById(c.level).name}</span>
                                {changedKeys.has(k) && <span className="changed-dot" title="未送信の変更" />}
                              </label>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                );
              })}
            </table>
          </div>
        </section>

        {/* ---- 操作パネル ---- */}
        <aside className="admin-side">
          <section className="card stack">
            <h2>② レベルを選んで反映</h2>
            <div className="level-picker" role="radiogroup" aria-label="障害レベル">
              {LEVELS.map((l) => (
                <label key={l.id} className={`level-option lv-${l.id} ${level === l.id ? 'active' : ''}`}>
                  <input
                    type="radio"
                    name="level"
                    value={l.id}
                    checked={level === l.id}
                    onChange={() => setLevel(l.id)}
                  />
                  <span className="level-option-name">{l.name}</span>
                  <span className="level-option-desc">{l.description}</span>
                </label>
              ))}
            </div>
            <label className="field">
              <span>メッセージ（掲示板に表示）</span>
              <textarea
                rows={3}
                value={message}
                disabled={level === 'normal'}
                placeholder="例）3F フロアスイッチ故障のため有線LANが不通。復旧見込み 30分"
                onChange={(e) => setMessage(e.target.value)}
              />
            </label>
            <button className="btn btn-primary" onClick={applyToSelected}>
              選択した {selected.size} 箇所に反映
            </button>
            <button className="btn btn-ghost" onClick={resetAll}>
              全て正常に戻す
            </button>
          </section>

          <section className="card stack">
            <h2>③ DB へ送信</h2>
            <label className="field">
              <span>更新者</span>
              <input value={operator} onChange={(e) => setOperator(e.target.value)} />
            </label>
            <p className="small muted">
              未送信の変更：<strong>{changedKeys.size}</strong> 箇所
            </p>
            <button className="btn btn-send" disabled={!dirty} onClick={publish}>
              DBへ送信
            </button>
            <button className="btn btn-ghost" disabled={!dirty} onClick={discard}>
              変更を破棄
            </button>
          </section>

          <section className="card stack">
            <h2>CSV で手動切り替え</h2>
            <p className="small muted">
              「CSV生成」で全拠点×全種別の一覧を出力し、level 列を編集して取り込みます。level は
              emergency / warning / notice / info / normal、または 緊急・警告・通達・情報・正常 が使えます。
              CSV に無い箇所は「正常」として扱います。
            </p>
            <button className="btn" onClick={exportCsv}>
              CSV生成（ダウンロード）
            </button>
            <button className="btn" onClick={() => fileRef.current?.click()}>
              CSV取り込み
            </button>
            <button className="link-btn small" onClick={exportTemplate}>
              空のテンプレートをダウンロード
            </button>
            <input
              ref={fileRef}
              type="file"
              accept=".csv,text/csv"
              hidden
              data-testid="csv-input"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) importCsv(f);
                e.target.value = '';
              }}
            />
          </section>
        </aside>
      </div>

      <section className="card">
        <h2>送信履歴</h2>
        {history.length === 0 ? (
          <p className="muted">まだ送信履歴はありません。</p>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>送信日時</th>
                <th>更新者</th>
                <th>方法</th>
                <th>障害件数</th>
              </tr>
            </thead>
            <tbody>
              {history.map((h) => (
                <tr key={h.publishedAt}>
                  <td>{formatDateTime(h.publishedAt)}</td>
                  <td>{h.publishedBy}</td>
                  <td>{SOURCE_LABEL[h.source]}</td>
                  <td>{h.activeCount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}

function CheckBox({
  checked,
  indeterminate,
  onChange,
}: {
  checked: boolean;
  indeterminate: boolean;
  onChange: () => void;
}) {
  const ref = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (ref.current) ref.current.indeterminate = indeterminate;
  }, [indeterminate]);
  return <input ref={ref} type="checkbox" checked={checked} onChange={onChange} />;
}
