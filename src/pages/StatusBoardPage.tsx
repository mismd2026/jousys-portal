import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  INCIDENT_TYPES,
  LEVELS,
  LOCATION_GROUPS,
  LOCATIONS,
  getCell,
  levelById,
  listActiveIncidents,
  worstLevelOf,
} from '../domain/status';
import { useStatus } from '../hooks/useStatus';
import LevelLegend, { LevelBadge } from '../components/LevelLegend';
import { formatDateTime } from '../lib/format';

export default function StatusBoardPage() {
  const { snapshot, reload } = useStatus();
  const [onlyAbnormal, setOnlyAbnormal] = useState(false);

  const active = useMemo(() => (snapshot ? listActiveIncidents(snapshot.cells) : []), [snapshot]);

  if (!snapshot) return <p className="muted">読み込み中…</p>;
  const { cells } = snapshot;

  const counts = LEVELS.filter((l) => l.id !== 'normal').map((l) => ({
    level: l,
    count: active.filter((a) => a.cell.level === l.id).length,
  }));

  return (
    <div className="stack-lg">
      <div className="page-head">
        <div>
          <h1>障害通知掲示板</h1>
          <p className="muted">
            どの拠点で・どの種類の障害が起きているかを一覧で表示します。色が付いている箇所が影響範囲です。
          </p>
        </div>
        <div className="page-head-actions">
          <button className="btn" onClick={reload}>
            最新の情報に更新
          </button>
          <Link className="btn btn-ghost" to="/status/admin">
            情シス用 更新画面
          </Link>
        </div>
      </div>

      <section className="card status-summary">
        <div className="summary-meta">
          <div>
            最終更新：<strong>{formatDateTime(snapshot.publishedAt)}</strong>
            <span className="muted">（{snapshot.publishedBy}）</span>
          </div>
          <LevelLegend />
        </div>
        <div className="summary-counts">
          {counts.map(({ level, count }) => (
            <div key={level.id} className={`count-tile lv-${level.id} ${count === 0 ? 'zero' : ''}`}>
              <span className="count-num">{count}</span>
              <span className="count-label">{level.name}</span>
            </div>
          ))}
        </div>
        {active.length === 0 ? (
          <p className="all-clear">✓ 現在、障害は発生していません。</p>
        ) : (
          <ul className="incident-list">
            {active.map((a) => (
              <li key={`${a.location.id}-${a.type.id}`} className={`incident lv-${a.cell.level}`}>
                <LevelBadge level={a.cell.level} />
                <div className="incident-body">
                  <div className="incident-title">
                    {a.location.name} ／ {a.type.name}
                  </div>
                  {a.cell.message && <div className="incident-msg">{a.cell.message}</div>}
                </div>
                <time className="muted small">{formatDateTime(a.cell.updatedAt)}</time>
              </li>
            ))}
          </ul>
        )}
      </section>

      <div className="toolbar">
        <h2>拠点別ステータス</h2>
        <label className="switch">
          <input
            type="checkbox"
            checked={onlyAbnormal}
            onChange={(e) => setOnlyAbnormal(e.target.checked)}
          />
          障害のある拠点のみ表示
        </label>
      </div>

      {LOCATION_GROUPS.map((g) => {
        const locs = LOCATIONS.filter(
          (l) => l.group === g.id && (!onlyAbnormal || worstLevelOf(cells, l.id) !== 'normal'),
        );
        if (locs.length === 0) return null;
        return (
          <section key={g.id} className="stack">
            <h3 className="group-title">{g.name}</h3>
            <div className={`loc-grid ${g.id === 'group' ? 'compact' : ''}`}>
              {locs.map((loc) => {
                const worst = worstLevelOf(cells, loc.id);
                return (
                  <article key={loc.id} className={`loc-card worst-${worst}`}>
                    <header className="loc-name">
                      {g.id === 'group' ? loc.name.replace('グループ会社', '') : loc.name}
                      {g.id === 'group' && <span className="muted small">グループ会社</span>}
                    </header>
                    <ul className="loc-cells">
                      {INCIDENT_TYPES.map((t) => {
                        const c = getCell(cells, loc.id, t.id);
                        return (
                          <li
                            key={t.id}
                            className={`loc-cell lv-${c.level}`}
                            title={c.message || levelById(c.level).description}
                          >
                            <span>{t.short}</span>
                            <span className="loc-cell-level">{levelById(c.level).name}</span>
                          </li>
                        );
                      })}
                    </ul>
                  </article>
                );
              })}
            </div>
          </section>
        );
      })}
    </div>
  );
}
