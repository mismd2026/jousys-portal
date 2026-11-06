// 情報セキュリティ教育動画
//
// src に YouTube の埋め込み URL（https://www.youtube.com/embed/xxxx）か
// mp4 等の動画ファイル URL を設定すると、プレーヤーで再生できる。
// 未設定の動画は「準備中」として表示する。

export interface SecurityVideo {
  id: string;
  title: string;
  category: string;
  durationMin: number;
  description: string;
  points: string[];
  src?: string;
  required: boolean; // 必須受講
  publishedAt: string;
}

export const VIDEOS: SecurityVideo[] = [
  {
    id: 'phishing',
    title: '標的型攻撃メールを見抜く',
    category: 'メール',
    durationMin: 8,
    description: '取引先や社内を装ったメールの特徴と、受け取ったときの正しい対応を学びます。',
    points: [
      '差出人の表示名ではなく、メールアドレスのドメインを確認する',
      '急がせる・不安をあおる文面は疑う',
      '開いてしまったら LAN ケーブルを抜き、すぐに情シスへ連絡',
    ],
    required: true,
    publishedAt: '2026-04-01',
  },
  {
    id: 'password-mfa',
    title: 'パスワードと多要素認証',
    category: 'アカウント',
    durationMin: 6,
    description: '使い回しの危険性と、多要素認証が不正ログインを防ぐ仕組みを解説します。',
    points: [
      'パスワードは長く、サービスごとに別のものにする',
      '身に覚えのない MFA 通知は承認しない',
      '機種変更前に情シスへ連絡',
    ],
    required: true,
    publishedAt: '2026-04-01',
  },
  {
    id: 'data-leak',
    title: '情報漏えいを防ぐ日常のルール',
    category: '情報管理',
    durationMin: 10,
    description: 'メール誤送信・USB メモリ・画面ののぞき見など、身近な漏えいの原因と対策です。',
    points: [
      '社外送信前に宛先をもう一度確認する',
      '私物 USB メモリは使わない。共有は OneDrive / SharePoint で',
      '離席時は Windows + L で画面をロック',
    ],
    required: true,
    publishedAt: '2026-05-10',
  },
  {
    id: 'ransomware',
    title: 'ランサムウェアの手口と備え',
    category: 'マルウェア',
    durationMin: 7,
    description: 'ファイルを暗号化して身代金を要求する攻撃の流れと、被害を広げないための行動を学びます。',
    points: [
      'OS とアプリの更新を後回しにしない',
      '不審なマクロ付きファイルは開かない',
      '異変に気付いたら電源を切らずにネットワークから切り離す',
    ],
    required: false,
    publishedAt: '2026-07-01',
  },
  {
    id: 'telework',
    title: 'テレワーク・外出先での注意点',
    category: '働き方',
    durationMin: 5,
    description: '公衆 Wi-Fi やカフェでの作業、PC の持ち出し時に気を付けることをまとめました。',
    points: [
      '公衆 Wi-Fi では VPN を必ず使う',
      'PC を置いたまま席を離れない',
      '紛失・盗難時は時間に関係なくすぐ連絡',
    ],
    required: false,
    publishedAt: '2026-08-20',
  },
  {
    id: 'generative-ai',
    title: '生成AIの安全な使い方',
    category: '新しい技術',
    durationMin: 9,
    description: '生成AIに入力してよい情報・いけない情報と、出力をそのまま使うリスクを解説します。',
    points: [
      '個人情報・顧客情報・社外秘は入力しない',
      '会社が許可したツールを使う',
      '出力内容は必ず人が事実確認する',
    ],
    required: false,
    publishedAt: '2026-10-24',
  },
];
