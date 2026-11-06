import { useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ARTICLES, KNOWLEDGE_CATEGORIES, type KnowledgeCategory } from '../data/knowledge';

const normalize = (s: string) => s.toLowerCase().normalize('NFKC');

export default function KnowledgePage() {
  const [params, setParams] = useSearchParams();
  const q = params.get('q') ?? '';
  const cat = (params.get('cat') as KnowledgeCategory | null) ?? null;

  const update = (next: { q?: string; cat?: string | null }) => {
    const p = new URLSearchParams(params);
    if (next.q !== undefined) (next.q ? p.set('q', next.q) : p.delete('q'));
    if (next.cat !== undefined) (next.cat ? p.set('cat', next.cat) : p.delete('cat'));
    setParams(p, { replace: true });
  };

  const results = useMemo(() => {
    const words = normalize(q).split(/\s+/).filter(Boolean);
    return ARTICLES.filter((a) => !cat || a.category === cat)
      .filter((a) => {
        if (words.length === 0) return true;
        const hay = normalize([a.title, a.summary, a.topic, ...a.tags, ...a.steps].join(' '));
        return words.every((w) => hay.includes(w));
      })
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  }, [q, cat]);

  const popularTags = ['Wi-Fi', 'MFA', 'パスワード', 'Teams', '紙詰まり', 'オフライン'];

  return (
    <div className="stack-lg">
      <div className="page-head">
        <div>
          <h1>PC・プリンター ナレッジ</h1>
          <p className="muted">よくある困りごとの解決手順です。キーワードで検索できます。</p>
        </div>
      </div>

      <div className="card stack">
        <input
          className="search"
          type="search"
          placeholder="例）Wi-Fi つながらない、紙詰まり、パスワード"
          value={q}
          onChange={(e) => update({ q: e.target.value })}
          aria-label="ナレッジを検索"
        />
        <div className="chips">
          <button className={`chip ${!cat ? 'active' : ''}`} onClick={() => update({ cat: null })}>
            すべて（{ARTICLES.length}）
          </button>
          {KNOWLEDGE_CATEGORIES.map((c) => (
            <button
              key={c.id}
              className={`chip ${cat === c.id ? 'active' : ''}`}
              onClick={() => update({ cat: c.id })}
            >
              {c.name}（{ARTICLES.filter((a) => a.category === c.id).length}）
            </button>
          ))}
          <span className="chips-sep" />
          {popularTags.map((t) => (
            <button key={t} className="chip chip-tag" onClick={() => update({ q: t })}>
              #{t}
            </button>
          ))}
        </div>
      </div>

      <p className="muted small">{results.length} 件</p>
      {results.length === 0 ? (
        <div className="card">
          <p>該当する記事が見つかりませんでした。キーワードを変えるか、ヘルプデスクへお問い合わせください。</p>
        </div>
      ) : (
        <div className="article-grid">
          {results.map((a) => (
            <Link key={a.id} to={`/knowledge/${a.id}`} className="card article-card">
              <div className="article-meta">
                <span className={`tag ${a.category === 'pc' ? 'tag-blue' : 'tag-green'}`}>
                  {KNOWLEDGE_CATEGORIES.find((c) => c.id === a.category)!.name}
                </span>
                <span className="muted small">{a.topic}</span>
              </div>
              <h3>{a.title}</h3>
              <p className="muted small">{a.summary}</p>
              <span className="muted small">更新 {a.updatedAt.replace(/-/g, '/')}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
