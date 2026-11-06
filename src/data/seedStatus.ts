import type { StatusSnapshot } from '../domain/status';

// 初回表示用のデモデータ（画面の見え方が分かるよう、いくつか障害を入れておく）
export const seedSnapshot = (): StatusSnapshot => {
  const now = Date.now();
  const ago = (min: number) => new Date(now - min * 60_000).toISOString();
  return {
    publishedAt: ago(5),
    publishedBy: 'デモデータ',
    cells: {
      'hq-3f:lan': {
        level: 'emergency',
        message: '3F フロアスイッチ故障のため有線LANが不通。交換作業中（復旧見込み 30分）',
        updatedAt: ago(5),
      },
      'hq-3f:internet': {
        level: 'warning',
        message: '社内LAN障害の影響で 3F からインターネットに接続できません。Wi-Fi(Corp-5G)をご利用ください',
        updatedAt: ago(5),
      },
      'branch-west:internet': {
        level: 'warning',
        message: '回線事業者側の障害により通信が遅延しています',
        updatedAt: ago(40),
      },
      'group-k:m365': {
        level: 'notice',
        message: '本日 20:00〜21:00 Exchange Online の設定変更を実施します',
        updatedAt: ago(120),
      },
      'group-m:m365': {
        level: 'info',
        message: 'Teams のサインイン障害は復旧しました',
        updatedAt: ago(90),
      },
    },
  };
};
