import { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { useStatus } from '../hooks/useStatus';
import { levelById, listActiveIncidents } from '../domain/status';
import { CONTACT } from '../data/activities';

const NAV = [
  { to: '/', label: '活動案内', end: true },
  { to: '/status', label: '障害通知', end: true },
  { to: '/knowledge', label: 'PC・プリンター ナレッジ', end: false },
  { to: '/security', label: 'セキュリティ動画', end: false },
];

export default function Layout() {
  const { snapshot } = useStatus();
  const [menuOpen, setMenuOpen] = useState(false);
  const { pathname } = useLocation();

  useEffect(() => {
    setMenuOpen(false);
    window.scrollTo(0, 0);
  }, [pathname]);

  const active = snapshot ? listActiveIncidents(snapshot.cells) : [];
  const worst = active[0]?.cell.level;
  const showBanner = worst === 'emergency' || worst === 'warning';

  return (
    <div className="app">
      <header className="site-header">
        <div className="container header-inner">
          <Link to="/" className="brand">
            <span className="brand-mark" aria-hidden>
              IT
            </span>
            <span>
              <span className="brand-title">情報システム部ポータル</span>
              <span className="brand-sub">Information Systems Dept.</span>
            </span>
          </Link>
          <button
            className="menu-toggle"
            aria-expanded={menuOpen}
            aria-label="メニュー"
            onClick={() => setMenuOpen((v) => !v)}
          >
            ☰
          </button>
          <nav className={`site-nav ${menuOpen ? 'open' : ''}`}>
            {NAV.map((n) => (
              <NavLink key={n.to} to={n.to} end={n.end}>
                {n.label}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>

      {showBanner && !pathname.startsWith('/status') && (
        <Link to="/status" className={`alert-banner lv-${worst}`}>
          <div className="container">
            <strong>【{levelById(worst!).name}】</strong>
            現在 {active.filter((a) => a.cell.level === 'emergency' || a.cell.level === 'warning').length}{' '}
            件の障害が発生しています。障害通知掲示板で影響範囲を確認してください →
          </div>
        </Link>
      )}

      <main className="container main">
        <Outlet />
      </main>

      <footer className="site-footer">
        <div className="container footer-inner">
          <div>
            <strong>{CONTACT.name}</strong>
            <div>
              {CONTACT.hours} ／ {CONTACT.ext} ／ {CONTACT.mail}
            </div>
          </div>
          <div className="muted small">
            社内向けポータルの再現デモです。会社名・連絡先・障害情報はすべて架空のものです。
          </div>
        </div>
      </footer>
    </div>
  );
}
