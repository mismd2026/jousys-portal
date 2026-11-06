// 障害ステータス ⇔ CSV の相互変換
// Excel で開いても文字化けしないよう、出力は UTF-8 (BOM付き)。
// 取り込みは UTF-8 / Shift_JIS の両方に対応する。

import {
  INCIDENT_TYPES,
  LEVELS,
  LOCATIONS,
  type LevelId,
  type StatusMap,
  cellKey,
  getCell,
  isIncidentTypeId,
  isLevelId,
  locationById,
} from '../domain/status';

export const CSV_HEADER = [
  'location_id',
  'location_name',
  'incident_type',
  'incident_type_name',
  'level',
  'message',
  'updated_at',
] as const;

const escapeField = (v: string): string =>
  /[",\r\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v;

/**
 * 全拠点 × 全障害種別の行を出力する（正常も含む）。
 * これをそのまま編集して取り込めば「手動切り替え」ができる。
 */
export const statusToCsv = (cells: StatusMap): string => {
  const lines = [CSV_HEADER.join(',')];
  for (const loc of LOCATIONS) {
    for (const type of INCIDENT_TYPES) {
      const c = getCell(cells, loc.id, type.id);
      lines.push(
        [loc.id, loc.name, type.id, type.name, c.level, c.message, c.updatedAt]
          .map(escapeField)
          .join(','),
      );
    }
  }
  return lines.join('\r\n') + '\r\n';
};

/** RFC 4180 準拠の簡易パーサ（ダブルクォート・改行を含むフィールドに対応） */
export const parseCsvRows = (text: string): string[][] => {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = '';
  let inQuotes = false;
  const src = text.replace(/^﻿/, '');

  for (let i = 0; i < src.length; i++) {
    const ch = src[i];
    if (inQuotes) {
      if (ch === '"') {
        if (src[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += ch;
      }
      continue;
    }
    if (ch === '"') inQuotes = true;
    else if (ch === ',') {
      row.push(field);
      field = '';
    } else if (ch === '\n' || ch === '\r') {
      if (ch === '\r' && src[i + 1] === '\n') i++;
      row.push(field);
      rows.push(row);
      row = [];
      field = '';
    } else field += ch;
  }
  if (field !== '' || row.length > 0) {
    row.push(field);
    rows.push(row);
  }
  return rows.filter((r) => !(r.length === 1 && r[0].trim() === ''));
};

// 日本語表記でも取り込めるようにする（Excel で手入力されるケースを想定）
const LEVEL_ALIASES: Record<string, LevelId> = Object.fromEntries([
  ...LEVELS.map((l) => [l.id, l.id]),
  ...LEVELS.map((l) => [l.name, l.id]),
  ['赤', 'emergency'],
  ['オレンジ', 'warning'],
  ['黄', 'notice'],
  ['黄色', 'notice'],
  ['青', 'info'],
  ['', 'normal'],
  ['なし', 'normal'],
]);

export interface CsvImportResult {
  cells: StatusMap;
  rowCount: number;
  errors: string[];
}

/**
 * CSV を StatusMap に変換する。
 * CSV に含まれない拠点・種別は「正常」とみなす（CSV の内容で全置換）。
 * 拠点は location_id、無ければ location_name で照合する。
 */
export const csvToStatus = (text: string, now: Date = new Date()): CsvImportResult => {
  const rows = parseCsvRows(text);
  const errors: string[] = [];
  const cells: StatusMap = {};
  if (rows.length === 0) return { cells, rowCount: 0, errors: ['CSV が空です'] };

  const header = rows[0].map((h) => h.trim());
  const col = (name: string) => header.indexOf(name);
  const iLoc = col('location_id');
  const iLocName = col('location_name');
  const iType = col('incident_type');
  const iTypeName = col('incident_type_name');
  const iLevel = col('level');
  const iMsg = col('message');
  const iUpd = col('updated_at');

  if ((iLoc < 0 && iLocName < 0) || (iType < 0 && iTypeName < 0) || iLevel < 0) {
    return {
      cells,
      rowCount: 0,
      errors: [`ヘッダー行が不正です。必要な列: ${CSV_HEADER.join(', ')}`],
    };
  }

  let rowCount = 0;
  rows.slice(1).forEach((r, idx) => {
    const lineNo = idx + 2;
    const get = (i: number) => (i >= 0 ? (r[i] ?? '').trim() : '');

    const loc =
      locationById(get(iLoc)) ?? LOCATIONS.find((l) => l.name === get(iLocName));
    if (!loc) {
      errors.push(`${lineNo}行目: 拠点「${get(iLoc) || get(iLocName)}」が見つかりません`);
      return;
    }

    const rawType = get(iType);
    const type = isIncidentTypeId(rawType)
      ? rawType
      : INCIDENT_TYPES.find((t) => t.name === get(iTypeName) || t.short === get(iTypeName))?.id;
    if (!type) {
      errors.push(`${lineNo}行目: 障害種別「${rawType || get(iTypeName)}」が不正です`);
      return;
    }

    const rawLevel = get(iLevel);
    const level = isLevelId(rawLevel) ? rawLevel : LEVEL_ALIASES[rawLevel];
    if (!level) {
      errors.push(`${lineNo}行目: 障害レベル「${rawLevel}」が不正です`);
      return;
    }

    rowCount++;
    if (level === 'normal') return;
    const upd = get(iUpd);
    cells[cellKey(loc.id, type)] = {
      level,
      message: get(iMsg),
      updatedAt: upd && !Number.isNaN(Date.parse(upd)) ? new Date(upd).toISOString() : now.toISOString(),
    };
  });

  return { cells, rowCount, errors };
};

/** ファイルのバイト列を文字列化。UTF-8 として不正なら Shift_JIS で読み直す */
export const decodeCsvBytes = (buf: ArrayBuffer): string => {
  try {
    return new TextDecoder('utf-8', { fatal: true }).decode(buf);
  } catch {
    return new TextDecoder('shift_jis').decode(buf);
  }
};

export const downloadText = (filename: string, text: string, withBom = true) => {
  const blob = new Blob([withBom ? '﻿' + text : text], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
};
