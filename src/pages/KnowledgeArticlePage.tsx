import { Link, useParams } from 'react-router-dom';
import { ARTICLES, KNOWLEDGE_CATEGORIES } from '../data/knowledge';

export default function KnowledgeArticlePage() {
  const { id } = useParams();
  const article = ARTICLES.find((a) => a.id === id);

  if (!article) {
    return (
      <div className="card stack">
        <h1>記事が見つかりません</h1>
        <Link to="/knowledge">ナレッジ一覧へ戻る</Link>
      </div>
    );
  }

  const related = ARTICLES.filter(
    (a) => a.id !== article.id && (a.topic === article.topic || a.tags.some((t) => article.tags.includes(t))),
  ).slice(0, 3);

  return (
    <div className="article-layout">
      <article className="card stack article">
        <p className="crumb">
          <Link to="/knowledge">ナレッジ</Link> ／{' '}
          <Link to={`/knowledge?cat=${article.category}`}>
            {KNOWLEDGE_CATEGORIES.find((c) => c.id === article.category)!.name}
          </Link>{' '}
          ／ {article.topic}
        </p>
        <h1>{article.title}</h1>
        <p className="lead">{article.summary}</p>

        <h2>手順</h2>
        <ol className="steps">
          {article.steps.map((s, i) => (
            <li key={i}>{s}</li>
          ))}
        </ol>

        {article.notes && (
          <div className="callout">
            <strong>注意</strong>
            <ul>
              {article.notes.map((n) => (
                <li key={n}>{n}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="chips">
          {article.tags.map((t) => (
            <Link key={t} className="chip chip-tag" to={`/knowledge?q=${encodeURIComponent(t)}`}>
              #{t}
            </Link>
          ))}
        </div>
        <p className="muted small">最終更新 {article.updatedAt.replace(/-/g, '/')}</p>
      </article>

      <aside className="stack">
        <div className="card stack">
          <h3>解決しない場合</h3>
          <p className="small">
            症状・試したこと・画面の写真を添えてヘルプデスクへご連絡ください。
          </p>
          <Link to="/status" className="btn btn-sm">
            障害通知を確認
          </Link>
        </div>
        {related.length > 0 && (
          <div className="card stack">
            <h3>関連する記事</h3>
            <ul className="plain-list">
              {related.map((r) => (
                <li key={r.id}>
                  <Link to={`/knowledge/${r.id}`}>{r.title}</Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </aside>
    </div>
  );
}
