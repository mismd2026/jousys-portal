import { useCallback, useEffect, useState } from 'react';
import type { StatusSnapshot } from '../domain/status';
import { statusRepository } from '../lib/statusRepository';

const POLL_MS = 30_000;

/** 公開中の障害ステータスを購読する（他タブでの更新・定期ポーリングに追従） */
export const useStatus = () => {
  const [snapshot, setSnapshot] = useState<StatusSnapshot | null>(null);

  const reload = useCallback(() => {
    statusRepository.load().then(setSnapshot);
  }, []);

  useEffect(() => {
    reload();
    const unsub = statusRepository.subscribe(setSnapshot);
    const timer = window.setInterval(reload, POLL_MS);
    return () => {
      unsub();
      window.clearInterval(timer);
    };
  }, [reload]);

  return { snapshot, reload };
};
