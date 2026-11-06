// 障害ステータスの永続化層。
// クライゼルでは DB 機能に保存していた部分を、ここではリポジトリインターフェースで抽象化。
// GitHub Pages（静的ホスティング）ではサーバーが無いため localStorage 実装を使う。
// 実運用では ApiStatusRepository（REST / Supabase 等）に差し替えるだけで画面側は変更不要。

import { normalizeCells, type StatusMap, type StatusSnapshot } from '../domain/status';
import { seedSnapshot } from '../data/seedStatus';

export interface PublishLog {
  publishedAt: string;
  publishedBy: string;
  activeCount: number;
  source: 'checkbox' | 'csv' | 'reset';
}

export interface StatusRepository {
  load(): Promise<StatusSnapshot>;
  publish(cells: StatusMap, by: string, source: PublishLog['source']): Promise<StatusSnapshot>;
  history(): Promise<PublishLog[]>;
  /** 他タブ・他端末での更新通知。解除関数を返す */
  subscribe(listener: (s: StatusSnapshot) => void): () => void;
}

const KEY = 'jousys.status.v1';
const HISTORY_KEY = 'jousys.status.history.v1';
const HISTORY_MAX = 30;

const readJson = <T,>(key: string, fallback: T): T => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
};

const writeJson = (key: string, value: unknown) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* ストレージ無効環境では保存できないが、画面は動かす */
  }
};

export class LocalStorageStatusRepository implements StatusRepository {
  private listeners = new Set<(s: StatusSnapshot) => void>();

  constructor() {
    if (typeof window !== 'undefined') {
      window.addEventListener('storage', (e) => {
        if (e.key === KEY) this.load().then((s) => this.emit(s));
      });
    }
  }

  async load(): Promise<StatusSnapshot> {
    return readJson<StatusSnapshot>(KEY, seedSnapshot());
  }

  async publish(cells: StatusMap, by: string, source: PublishLog['source']) {
    const snap: StatusSnapshot = {
      cells: normalizeCells(cells),
      publishedAt: new Date().toISOString(),
      publishedBy: by,
    };
    writeJson(KEY, snap);
    const hist = readJson<PublishLog[]>(HISTORY_KEY, []);
    hist.unshift({
      publishedAt: snap.publishedAt!,
      publishedBy: by,
      activeCount: Object.keys(snap.cells).length,
      source,
    });
    writeJson(HISTORY_KEY, hist.slice(0, HISTORY_MAX));
    this.emit(snap);
    return snap;
  }

  async history() {
    return readJson<PublishLog[]>(HISTORY_KEY, []);
  }

  subscribe(listener: (s: StatusSnapshot) => void) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private emit(s: StatusSnapshot) {
    this.listeners.forEach((l) => l(s));
  }
}

export const statusRepository: StatusRepository = new LocalStorageStatusRepository();
