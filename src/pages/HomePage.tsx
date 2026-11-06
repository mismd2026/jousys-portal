import { Link } from 'react-router-dom';
import { ANNOUNCEMENTS, CONTACT, SERVICES } from '../data/activities';
import { useStatus } from '../hooks/useStatus';
import { listActiveIncidents } from '../domain/status';
import { LevelBadge } from '../components/LevelLegend';
import { formatDateTime } from '../lib/format';

const QUICK_LINKS = [
  { to: '/status', title: '障害通知掲示板', desc: 'いま、どこで障害が起きているか' },
  { to: '/knowledge', title: 'PC・プリンター ナレッジ', desc: '困ったときの自己解決ガイド' },
  { to: '/security', title: '情報セキュリティ動画', desc: '必須受講の教育動画' },
];

export default function HomePage() {
  const { snapshot } = useStatus();
  const active = snapshot ? listActiveIncidents(snapshot.cells) : [];

  return (
    <div className="stack-lg">
      <section className="hero">
        <div>
          <p className="eyebrow">情報システム部</p>
          <h1>安心して働ける IT 環境を、全拠点に。</h1>
          <p className="hero-lead">
            本社・支店・グループ各社の PC、ネットワーク、アカウント、セキュリティを支えています。
            困ったときはまずこのポータルを確認してください。
          </p>
        </div>
        <div className="hero-status card">
          <div className="hero-status-head">
            <h2>現在の障害状況</h2>
            <Link to="/status" className="small">
              掲示板を見る →
            </Link>
          </div>
          {!snapshot ? (
            <p className="muted">読み込み中…</p>
          ) : active.length === 0 ? (
            <p className="all-clear">✓ 障害は発生していません</p>
          ) : (
            <ul className="mini-incidents">
              {active.slice(0, 4).map((a) => (
                <li key={`${a.location.id}-${a.type.id}`}>
                  <LevelBadge level={a.cell.level} />
                  <span>
                    {a.location.name}／{a.type.short}
                  </span>
                </li>
              ))}
              {active.length > 4 && <li className="muted small">ほか {active.length - 4} 件</li>}
            </ul>
          )}
          {snapshot && <p className="muted small">更新：{formatDateTime(snapshot.publishedAt)}</p>}
        </div>
      </section>

      <section className="quick-links">
        {QUICK_LINKS.map((q) => (
          <Link key={q.to} to={q.to} className="quick-link card">
            <strong>{q.title}</strong>
            <span className="muted small">{q.desc}</span>
          </Link>
        ))}
      </section>

      <section className="stack">
        <h2>情シスの活動内容</h2>
        <div className="service-grid">
          {SERVICES.map((s) => (
            <article key={s.id} className="card service">
              <div className="service-icon" aria-hidden>
                {s.icon}
              </div>
              <h3>{s.title}</h3>
              <p className="muted">{s.summary}</p>
              <ul className="check-list">
                {s.items.map((i) => (
                  <li key={i}>{i}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>

      <div className="two-col">
        <section className="card stack">
          <h2>お知らせ</h2>
          <ul className="news">
            {ANNOUNCEMENTS.map((a) => (
              <li key={a.title}>
                <time>{a.date.replace(/-/g, '/')}</time>
                <span className={`tag tag-${a.category === '重要' ? 'red' : a.category === 'メンテナンス' ? 'orange' : 'blue'}`}>
                  {a.category}
                </span>
                <span>{a.title}</span>
              </li>
            ))}
          </ul>
        </section>
        <section className="card stack contact">
          <h2>お問い合わせ</h2>
          <dl>
            <dt>窓口</dt>
            <dd>{CONTACT.name}</dd>
            <dt>受付時間</dt>
            <dd>{CONTACT.hours}</dd>
            <dt>電話</dt>
            <dd>{CONTACT.ext}</dd>
            <dt>メール</dt>
            <dd>{CONTACT.mail}</dd>
            <dt>Teams</dt>
            <dd>{CONTACT.teams}</dd>
          </dl>
          <p className="small muted">
            障害の連絡の前に、障害通知掲示板で既知の障害か確認いただくと対応がスムーズです。
          </p>
        </section>
      </div>
    </div>
  );
}
