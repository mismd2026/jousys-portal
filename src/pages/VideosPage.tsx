import { useEffect, useMemo, useState } from 'react';
import { VIDEOS, type SecurityVideo } from '../data/videos';

const WATCHED_KEY = 'jousys.videos.watched.v1';

const loadWatched = (): string[] => {
  try {
    return JSON.parse(localStorage.getItem(WATCHED_KEY) ?? '[]');
  } catch {
    return [];
  }
};

export default function VideosPage() {
  const [watched, setWatched] = useState<string[]>(loadWatched);
  const [category, setCategory] = useState<string | null>(null);
  const [playing, setPlaying] = useState<SecurityVideo | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem(WATCHED_KEY, JSON.stringify(watched));
    } catch {
      /* noop */
    }
  }, [watched]);

  useEffect(() => {
    if (!playing) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setPlaying(null);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [playing]);

  const categories = useMemo(() => [...new Set(VIDEOS.map((v) => v.category))], []);
  const required = VIDEOS.filter((v) => v.required);
  const requiredDone = required.filter((v) => watched.includes(v.id)).length;
  const pct = Math.round((requiredDone / required.length) * 100);
  const list = VIDEOS.filter((v) => !category || v.category === category);

  const markWatched = (id: string) => setWatched((w) => (w.includes(id) ? w : [...w, id]));
  const unmark = (id: string) => setWatched((w) => w.filter((x) => x !== id));

  return (
    <div className="stack-lg">
      <div className="page-head">
        <div>
          <h1>情報セキュリティ動画</h1>
          <p className="muted">全従業員向けのセキュリティ教育動画です。「必須」の動画は年度内に受講してください。</p>
        </div>
      </div>

      <section className="card progress-card">
        <div>
          <strong>必須動画の受講状況</strong>
          <div className="muted small">
            {requiredDone} / {required.length} 本 受講済み
            {pct === 100 && ' — 今年度の必須受講は完了しています 🎉'}
          </div>
        </div>
        <div
          className="progress"
          role="progressbar"
          aria-valuenow={pct}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div className="progress-bar" style={{ width: `${pct}%` }} />
        </div>
        <span className="progress-pct">{pct}%</span>
      </section>

      <div className="chips">
        <button className={`chip ${!category ? 'active' : ''}`} onClick={() => setCategory(null)}>
          すべて
        </button>
        {categories.map((c) => (
          <button key={c} className={`chip ${category === c ? 'active' : ''}`} onClick={() => setCategory(c)}>
            {c}
          </button>
        ))}
      </div>

      <div className="video-grid">
        {list.map((v, i) => {
          const done = watched.includes(v.id);
          return (
            <article key={v.id} className="card video-card">
              <button className={`video-thumb thumb-${i % 6}`} onClick={() => setPlaying(v)} aria-label={`${v.title}を再生`}>
                <span className="play" aria-hidden>
                  ▶
                </span>
                <span className="duration">{v.durationMin}:00</span>
                {done && <span className="watched-flag">受講済み</span>}
              </button>
              <div className="video-body">
                <div className="article-meta">
                  {v.required && <span className="tag tag-red">必須</span>}
                  <span className="tag">{v.category}</span>
                </div>
                <h3>{v.title}</h3>
                <p className="muted small">{v.description}</p>
              </div>
            </article>
          );
        })}
      </div>

      {playing && (
        <div className="modal-backdrop" onClick={() => setPlaying(null)}>
          <div className="modal" role="dialog" aria-modal="true" aria-label={playing.title} onClick={(e) => e.stopPropagation()}>
            <div className="modal-head">
              <h2>{playing.title}</h2>
              <button className="link-btn" onClick={() => setPlaying(null)} aria-label="閉じる">
                ×
              </button>
            </div>
            <div className="player">
              {playing.src ? (
                playing.src.includes('youtube.com/embed') ? (
                  <iframe
                    src={playing.src}
                    title={playing.title}
                    allow="accelerometer; encrypted-media; picture-in-picture"
                    allowFullScreen
                  />
                ) : (
                  <video src={playing.src} controls onEnded={() => markWatched(playing.id)} />
                )
              ) : (
                <div className="player-placeholder">
                  <span className="play" aria-hidden>
                    ▶
                  </span>
                  <p>動画は準備中です</p>
                  <p className="small">src/data/videos.ts の src に動画 URL を設定すると再生できます</p>
                </div>
              )}
            </div>
            <div className="stack">
              <p>{playing.description}</p>
              <div className="callout callout-blue">
                <strong>この動画のポイント</strong>
                <ul>
                  {playing.points.map((p) => (
                    <li key={p}>{p}</li>
                  ))}
                </ul>
              </div>
              <div className="modal-actions">
                {watched.includes(playing.id) ? (
                  <>
                    <span className="all-clear">✓ 受講済み</span>
                    <button className="link-btn small" onClick={() => unmark(playing.id)}>
                      未受講に戻す
                    </button>
                  </>
                ) : (
                  <button className="btn btn-primary" onClick={() => markWatched(playing.id)}>
                    視聴を完了する
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
