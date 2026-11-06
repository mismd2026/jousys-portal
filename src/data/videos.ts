// 情報セキュリティ教育動画
//
// IPA（独立行政法人情報処理推進機構）「映像で知る情報セキュリティ」の YouTube 公開動画を埋め込んで利用する。
// 出典：https://www.ipa.go.jp/security/videos/list.html
// IPA の案内では、IPA Channel の動画はブラウザで再生して社内研修等に利用でき、事前申請は不要。
// 動画ファイル（mp4）は IPA の申込ページ経由で提供されるため、本リポジトリには含めない。
// 社内サーバーに置いた動画を使う場合は youtubeId の代わりに src に URL を設定する。

export interface SecurityVideo {
  id: string;
  title: string;
  category: string;
  durationMin: number; // 約N分
  description: string;
  points: string[];
  youtubeId?: string;
  src?: string; // mp4 等の動画ファイル URL
  required: boolean; // 必須受講
  publishedAt: string; // IPA 公開日
}

export const VIDEO_SOURCE = {
  name: 'IPA「映像で知る情報セキュリティ」',
  url: 'https://www.ipa.go.jp/security/videos/list.html',
};

export const VIDEOS: SecurityVideo[] = [
  {
    id: 'targeted-mail',
    title: 'そのメール本当に信用してもいいんですか？ 標的型サイバー攻撃メールの手口と対策',
    category: 'メール',
    durationMin: 10,
    youtubeId: '5K9U0-ASQM8',
    description: '業務を装って送られてくる標的型攻撃メールの手口と、受け取ったときの対策を学びます。',
    points: [
      '差出人の表示名ではなく、メールアドレスのドメインを確認する',
      '急がせる・不安をあおる文面、不自然な添付ファイルは疑う',
      '開いてしまったら LAN ケーブルを抜き、すぐに情シスへ連絡',
    ],
    required: true,
    publishedAt: '2016-03-31',
  },
  {
    id: 'password',
    title: 'あなたのパスワードは大丈夫？ インターネットサービスの不正ログイン対策',
    category: 'アカウント',
    durationMin: 10,
    youtubeId: 'lXh0b4KS9gE',
    description: 'パスワードの使い回しが招く不正ログインの被害と、その防ぎ方を学びます。',
    points: [
      'パスワードは長く、サービスごとに別のものにする',
      '会社アカウントは多要素認証（MFA）を必ず登録する',
      '身に覚えのない MFA 通知は承認しない',
    ],
    required: true,
    publishedAt: '2018-04-03',
  },
  {
    id: 'three-bags',
    title: '3つのかばん 新入社員が知るべき情報漏えいの脅威',
    category: '情報管理',
    durationMin: 11,
    youtubeId: 'FljLaQA-cRU',
    description: '日常業務の中に潜む情報漏えいのリスクを、新入社員の目線で学びます。',
    points: [
      '社外送信前に宛先をもう一度確認する',
      '私物 USB メモリは使わない。共有は OneDrive / SharePoint で',
      '離席時は Windows + L で画面をロック',
    ],
    required: true,
    publishedAt: '2014-03-31',
  },
  {
    id: 'ransomware',
    title: '今、そこにある脅威 組織を狙うランサムウェア攻撃',
    category: 'サイバー攻撃',
    durationMin: 15,
    youtubeId: 'TWqJ5P8oaUM',
    description: '組織を狙うランサムウェア攻撃の実態と、被害を防ぐ・広げないための備えを学びます。',
    points: [
      'OS とアプリの更新を後回しにしない',
      '不審なファイル・リンクは開かない',
      '異変に気付いたらネットワークから切り離し、すぐ連絡',
    ],
    required: false,
    publishedAt: '2023-03-15',
  },
  {
    id: 'bec',
    title: "What's BEC ? ビジネスメール詐欺 手口と対策",
    category: 'メール',
    durationMin: 12,
    youtubeId: '6DKJEG3woRU',
    description: '取引先や経営者になりすまして送金させるビジネスメール詐欺の手口と対策です。',
    points: [
      '振込先変更の依頼はメール以外の手段で本人に確認する',
      '急ぎ・内密を強調する依頼ほど慎重に',
      '少しでも怪しいと思ったら一人で判断せず相談する',
    ],
    required: false,
    publishedAt: '2022-03-11',
  },
  {
    id: 'insider',
    title: '今、そこにある脅威 内部不正による情報流出のリスク',
    category: '情報管理',
    durationMin: 18,
    youtubeId: 'VDAYBeA1TTc',
    description: '内部不正による情報流出がどのように起きるのか、組織としてのリスクを学びます。',
    points: [
      '業務に必要な範囲の情報だけにアクセスする',
      '持ち出し・私的利用のルールを守る',
      '気付いた不審な行動は窓口に相談する',
    ],
    required: false,
    publishedAt: '2024-03-21',
  },
  {
    id: 'telework',
    title: '妻からのメッセージ テレワークのセキュリティ',
    category: '働き方',
    durationMin: 10,
    youtubeId: 'zDs88SLymwo',
    description: '自宅や外出先で仕事をするときに気を付けたいセキュリティのポイントです。',
    points: [
      '公衆 Wi-Fi では VPN を必ず使う',
      '家族と共用の端末で業務をしない',
      '紛失・盗難時は時間に関係なくすぐ連絡',
    ],
    required: false,
    publishedAt: '2021-03-10',
  },
  {
    id: 'fake-warning',
    title: 'その警告メッセージ、信じて大丈夫？ ブラウザの"偽警告"にご用心！',
    category: 'ウェブ',
    durationMin: 11,
    youtubeId: 'sm1UMc97zRc',
    description: 'ウイルス感染などを装ってブラウザに表示される偽の警告と、その対処法です。',
    points: [
      '表示された電話番号に電話しない・ソフトを入れない',
      'ブラウザを閉じれば多くの場合は解消する',
      '閉じられない・操作してしまったときは情シスへ連絡',
    ],
    required: false,
    publishedAt: '2017-04-03',
  },
];

export const youtubeEmbedUrl = (id: string) => `https://www.youtube-nocookie.com/embed/${id}?rel=0`;
export const youtubeWatchUrl = (id: string) => `https://www.youtube.com/watch?v=${id}`;
export const youtubeThumbUrl = (id: string) => `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
