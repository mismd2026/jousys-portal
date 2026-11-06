import { describe, expect, it } from 'vitest';
import { csvToStatus, parseCsvRows, statusToCsv, decodeCsvBytes } from './csv';
import { INCIDENT_TYPES, LOCATIONS, type StatusMap } from '../domain/status';

describe('parseCsvRows', () => {
  it('クォート・カンマ・改行を含むフィールドを扱える', () => {
    const rows = parseCsvRows('a,b\r\n"x, y","he said ""hi""\nnext"\r\n');
    expect(rows).toEqual([
      ['a', 'b'],
      ['x, y', 'he said "hi"\nnext'],
    ]);
  });

  it('BOM と末尾の空行を無視する', () => {
    expect(parseCsvRows('﻿a,b\n1,2\n\n')).toEqual([
      ['a', 'b'],
      ['1', '2'],
    ]);
  });
});

describe('statusToCsv / csvToStatus', () => {
  const cells: StatusMap = {
    'hq-3f:lan': { level: 'emergency', message: '3F スイッチ故障, 交換中', updatedAt: '2026-11-06T01:00:00.000Z' },
    'group-c:m365': { level: 'info', message: 'Teams 復旧済み', updatedAt: '2026-11-06T02:00:00.000Z' },
  };

  it('全拠点×全種別の行を出力する', () => {
    const csv = statusToCsv(cells);
    const rows = parseCsvRows(csv);
    expect(rows.length).toBe(1 + LOCATIONS.length * INCIDENT_TYPES.length);
  });

  it('出力した CSV を取り込むと元に戻る（往復）', () => {
    const result = csvToStatus(statusToCsv(cells));
    expect(result.errors).toEqual([]);
    expect(result.cells).toEqual(cells);
  });

  it('日本語のレベル名・拠点名でも取り込める', () => {
    const csv = [
      'location_name,incident_type_name,level,message',
      '西日本支店,インターネット,警告,回線遅延',
      'グループ会社Z,社内LAN障害,黄色,計画停止',
    ].join('\n');
    const r = csvToStatus(csv, new Date('2026-11-06T00:00:00Z'));
    expect(r.errors).toEqual([]);
    expect(r.cells['branch-west:internet'].level).toBe('warning');
    expect(r.cells['group-z:lan'].level).toBe('notice');
    expect(r.cells['group-z:lan'].updatedAt).toBe('2026-11-06T00:00:00.000Z');
  });

  it('不正な行はエラーとして報告し、他の行は取り込む', () => {
    const csv = [
      'location_id,incident_type,level,message',
      'hq-9f,lan,emergency,x',
      'hq-1f,wifi,emergency,x',
      'hq-1f,lan,critical,x',
      'hq-2f,lan,warning,ok',
    ].join('\n');
    const r = csvToStatus(csv);
    expect(r.errors).toHaveLength(3);
    expect(Object.keys(r.cells)).toEqual(['hq-2f:lan']);
  });

  it('ヘッダーが不正ならエラー', () => {
    expect(csvToStatus('foo,bar\n1,2').errors[0]).toMatch(/ヘッダー/);
  });
});

describe('decodeCsvBytes', () => {
  it('UTF-8 をそのまま読む', () => {
    const buf = new TextEncoder().encode('拠点').buffer;
    expect(decodeCsvBytes(buf)).toBe('拠点');
  });

  it('Shift_JIS にフォールバックする', () => {
    // "緊急" の Shift_JIS バイト列
    const sjis = new Uint8Array([0x8b, 0xd9, 0x8b, 0x7d]);
    expect(decodeCsvBytes(sjis.buffer)).toBe('緊急');
  });
});
