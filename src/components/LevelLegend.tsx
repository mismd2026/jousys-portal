import { LEVELS, type LevelId, levelById } from '../domain/status';

export function LevelBadge({ level }: { level: LevelId }) {
  return <span className={`level-badge lv-${level}`}>{levelById(level).name}</span>;
}

export default function LevelLegend() {
  return (
    <ul className="legend" aria-label="障害レベルの凡例">
      {LEVELS.map((l) => (
        <li key={l.id} title={l.description}>
          <span className={`legend-swatch lv-${l.id}`} aria-hidden />
          {l.name}
        </li>
      ))}
    </ul>
  );
}
