// 情シスの活動内容（トップページ）

export interface Service {
  id: string;
  icon: string; // 1文字アイコン
  title: string;
  summary: string;
  items: string[];
}

export const SERVICES: Service[] = [
  {
    id: 'support',
    icon: '?',
    title: '問い合わせ・トラブル対応',
    summary: 'PC・プリンター・業務アプリの困りごとに、情報システム部が直接対応します。',
    items: ['操作方法の問い合わせ対応', '故障受付・代替機の手配', 'リモートサポート'],
  },
  {
    id: 'account',
    icon: 'ID',
    title: 'アカウント・ライセンス管理',
    summary: '入退社・異動に合わせたアカウントとライセンスを管理します。',
    items: ['Microsoft 365 アカウント発行・削除', 'ライセンス付与・棚卸し', 'SSO（シングルサインオン）連携'],
  },
  {
    id: 'kitting',
    icon: 'PC',
    title: 'PC キッティング・資産管理',
    summary: '業務用 PC の調達から廃棄までを管理します。',
    items: ['PC 購入申請の受付・稟議', 'キッティング（初期設定）の自動化', '資産台帳の管理・割り当て'],
  },
  {
    id: 'network',
    icon: 'NW',
    title: 'ネットワーク・インフラ',
    summary: '本社・支店・グループ会社をつなぐ基盤を運用しています。',
    items: ['社内 LAN / Wi-Fi の運用', 'インターネット回線・データセンター管理', '障害監視と障害通知'],
  },
  {
    id: 'security',
    icon: '盾',
    title: '情報セキュリティ',
    summary: '安全に業務ができるよう、仕組みと教育の両面で取り組みます。',
    items: ['多要素認証（MFA）の推進', 'セキュリティ教育動画の配信', '不審メール・インシデントの受付'],
  },
  {
    id: 'm365',
    icon: '365',
    title: 'Microsoft 365 運用',
    summary: 'Teams・Outlook・SharePoint などの利用環境を整備します。',
    items: ['Teams / SharePoint の権限設計', 'メール・配布リスト管理', '計画メンテナンスの周知'],
  },
];

export interface Announcement {
  date: string; // YYYY-MM-DD
  category: '重要' | 'メンテナンス' | 'お知らせ';
  title: string;
}

export const ANNOUNCEMENTS: Announcement[] = [
  { date: '2026-11-05', category: 'メンテナンス', title: '11/14(土) 22:00〜 本社ネットワーク機器のファームウェア更新を行います' },
  { date: '2026-11-01', category: '重要', title: '多要素認証（MFA）の登録期限は 11/30 です。未登録の方はナレッジを参照してください' },
  { date: '2026-10-24', category: 'お知らせ', title: 'セキュリティ教育動画に IPA「ビジネスメール詐欺」「偽警告」などを追加しました' },
  { date: '2026-10-10', category: 'お知らせ', title: '本社 2F 複合機の入れ替えが完了しました。ドライバの再設定をお願いします' },
];

export const CONTACT = {
  name: '情報システム部',
  hours: '平日 9:00〜18:00',
  ext: '内線 1234',
  mail: 'jouhou-system@example.co.jp',
  teams: 'Teams チャネル「情シス問い合わせ」',
};
