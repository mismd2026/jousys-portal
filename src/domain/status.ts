// 障害通知のドメイン定義（拠点・障害種別・障害レベル）

export type LocationGroup = 'hq' | 'branch' | 'group';

export interface Location {
  id: string;
  name: string;
  group: LocationGroup;
}

export const LOCATION_GROUPS: { id: LocationGroup; name: string }[] = [
  { id: 'hq', name: '本社' },
  { id: 'branch', name: '支店' },
  { id: 'group', name: 'グループ会社' },
];

const HQ_FLOORS = [1, 2, 3, 4, 5];
const GROUP_LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

export const LOCATIONS: Location[] = [
  ...HQ_FLOORS.map((f) => ({ id: `hq-${f}f`, name: `本社 ${f}F`, group: 'hq' as const })),
  { id: 'branch-west', name: '西日本支店', group: 'branch' },
  { id: 'branch-east', name: '東日本支店', group: 'branch' },
  ...GROUP_LETTERS.map((l) => ({
    id: `group-${l.toLowerCase()}`,
    name: `グループ会社${l}`,
    group: 'group' as const,
  })),
];

export type IncidentTypeId = 'internet' | 'lan' | 'm365';

export interface IncidentType {
  id: IncidentTypeId;
  name: string;
  short: string;
}

export const INCIDENT_TYPES: IncidentType[] = [
  { id: 'internet', name: 'インターネット接続障害', short: 'インターネット' },
  { id: 'lan', name: '社内LAN障害', short: '社内LAN' },
  { id: 'm365', name: 'Microsoft 365 関連障害', short: '365' },
];

export type LevelId = 'emergency' | 'warning' | 'notice' | 'info' | 'normal';

export interface Level {
  id: LevelId;
  name: string;
  /** 重大度。数値が大きいほど深刻 */
  severity: number;
  description: string;
}

/** 深刻度の高い順 */
export const LEVELS: Level[] = [
  { id: 'emergency', name: '緊急', severity: 4, description: '業務停止レベル。至急の対応中' },
  { id: 'warning', name: '警告', severity: 3, description: '一部業務に影響あり' },
  { id: 'notice', name: '通達', severity: 2, description: '計画停止・注意喚起など' },
  { id: 'info', name: '情報', severity: 1, description: '復旧済み・参考情報' },
  { id: 'normal', name: '正常', severity: 0, description: '問題なし' },
];

export const levelById = (id: LevelId): Level => LEVELS.find((l) => l.id === id)!;

export const isLevelId = (v: string): v is LevelId => LEVELS.some((l) => l.id === v);
export const isIncidentTypeId = (v: string): v is IncidentTypeId =>
  INCIDENT_TYPES.some((t) => t.id === v);
export const locationById = (id: string): Location | undefined =>
  LOCATIONS.find((l) => l.id === id);

export interface CellStatus {
  level: LevelId;
  message: string;
  updatedAt: string; // ISO8601
}

/** key = `${locationId}:${incidentTypeId}` 。正常のセルは保持しない */
export type StatusMap = Record<string, CellStatus>;

export interface StatusSnapshot {
  cells: StatusMap;
  publishedAt: string | null;
  publishedBy: string;
}

export const cellKey = (locationId: string, typeId: IncidentTypeId) => `${locationId}:${typeId}`;

export const getCell = (cells: StatusMap, locationId: string, typeId: IncidentTypeId): CellStatus =>
  cells[cellKey(locationId, typeId)] ?? { level: 'normal', message: '', updatedAt: '' };

/** 拠点の中で最も深刻なレベル */
export const worstLevelOf = (cells: StatusMap, locationId: string): LevelId => {
  let worst: Level = levelById('normal');
  for (const t of INCIDENT_TYPES) {
    const l = levelById(getCell(cells, locationId, t.id).level);
    if (l.severity > worst.severity) worst = l;
  }
  return worst.id;
};

export interface ActiveIncident {
  location: Location;
  type: IncidentType;
  cell: CellStatus;
}

/** 正常以外のセルを深刻度順に列挙 */
export const listActiveIncidents = (cells: StatusMap): ActiveIncident[] => {
  const out: ActiveIncident[] = [];
  for (const loc of LOCATIONS) {
    for (const type of INCIDENT_TYPES) {
      const cell = getCell(cells, loc.id, type.id);
      if (cell.level !== 'normal') out.push({ location: loc, type, cell });
    }
  }
  return out.sort(
    (a, b) => levelById(b.cell.level).severity - levelById(a.cell.level).severity,
  );
};

/** 正常セルを除去して正規化 */
export const normalizeCells = (cells: StatusMap): StatusMap => {
  const out: StatusMap = {};
  for (const [k, v] of Object.entries(cells)) if (v.level !== 'normal') out[k] = v;
  return out;
};
