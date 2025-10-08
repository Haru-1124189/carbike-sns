import { Channel, MaintenancePost, MaintenanceRecord, Notification, PrivateGroup, QuickAction, Thread, User, Video } from '../types';

export const carModels: string[] = [
  // Aprilia (バイク)
  "Aprilia Dorsoduro",
  "Aprilia RS660",
  "Aprilia RSV4",
  "Aprilia Shiver 900",
  "Aprilia Tuono 660",
  "Aprilia Tuono V4",
  
  // Audi (車)
  "Audi A3",
  "Audi A4",
  "Audi A6",
  "Audi R8",
  "Audi RS3",
  "Audi RS4",
  "Audi RS6",
  "Audi TT",
  
  // BMW (車)
  "BMW 1 Series",
  "BMW 3 Series",
  "BMW 5 Series",
  "BMW E30",
  "BMW E36",
  "BMW E46",
  "BMW E92",
  "BMW M3",
  "BMW M4",
  "BMW M5",
  "BMW Z4",
  
  // BMW (バイク)
  "BMW F850GS",
  "BMW F900R",
  "BMW K1600GT",
  "BMW R nineT",
  "BMW R1250GS",
  "BMW R1250RT",
  "BMW S1000R",
  "BMW S1000RR",
  "BMW S1000XR",
  
  // Benelli (バイク)
  "Benelli Leoncino 500",
  "Benelli TRK 502",
  "Benelli TNT 300",
  "Benelli TNT 600",
  
  // Bugatti (車)
  "Bugatti Chiron",
  "Bugatti Divo",
  "Bugatti Veyron",
  
  // CFMoto (バイク)
  "CFMoto 650MT",
  "CFMoto 650NK",
  "CFMoto 700CL-X",
  "CFMoto 800MT",
  
  // Chevrolet (車)
  "Chevrolet Camaro",
  "Chevrolet Corvette",
  "Chevrolet Impala",
  
  // Daihatsu (車)
  "Daihatsu Copen",
  "Daihatsu Mira",
  "Daihatsu Move",
  
  // Dodge (車)
  "Dodge Challenger",
  "Dodge Charger",
  "Dodge Viper",
  
  // Ducati (バイク)
  "Ducati Diavel",
  "Ducati Hypermotard",
  "Ducati Monster",
  "Ducati Multistrada",
  "Ducati Panigale V2",
  "Ducati Panigale V4",
  "Ducati Scrambler",
  "Ducati Streetfighter",
  "Ducati XDiavel",
  
  // Ferrari (車)
  "Ferrari 458",
  "Ferrari 488",
  "Ferrari Enzo",
  "Ferrari F40",
  "Ferrari F50",
  "Ferrari F8",
  "Ferrari LaFerrari",
  "Ferrari SF90",
  
  // Ford (車)
  "Ford Fiesta ST",
  "Ford Focus RS",
  "Ford GT",
  "Ford Mustang",
  
  // Harley-Davidson (バイク)
  "Harley-Davidson Fat Boy",
  "Harley-Davidson Heritage Classic",
  "Harley-Davidson Road Glide",
  "Harley-Davidson Road King",
  "Harley-Davidson Softail",
  "Harley-Davidson Sportster",
  "Harley-Davidson Street Glide",
  "Harley-Davidson Touring",
  
  // Honda (車)
  "Honda Accord",
  "Honda Civic EG6",
  "Honda Civic EK9",
  "Honda Civic EP3",
  "Honda Civic FD2",
  "Honda Civic FK8",
  "Honda Civic FL5",
  "Honda Integra DC2",
  "Honda Integra DC5",
  "Honda NSX NA1",
  "Honda NSX NC1",
  "Honda Prelude",
  "Honda S2000 AP1",
  "Honda S2000 AP2",
  
  // Honda (バイク)
  "Honda Africa Twin",
  "Honda CB400SF",
  "Honda CB750",
  "Honda CB1000R",
  "Honda CBR600RR",
  "Honda CBR1000RR",
  "Honda CRF250R",
  "Honda CRF450R",
  "Honda Gold Wing",
  "Honda Grom",
  "Honda Monkey",
  "Honda Rebel",
  "Honda Shadow",
  "Honda Super Cub",
  "Honda Valkyrie",
  "Honda VFR800",
  "Honda VFR1200F",
  
  // Husqvarna (バイク)
  "Husqvarna 250 FE",
  "Husqvarna 450 FE",
  "Husqvarna 701 Enduro",
  "Husqvarna 701 Supermoto",
  "Husqvarna Svartpilen 701",
  "Husqvarna Vitpilen 701",
  
  // Indian (バイク)
  "Indian Chieftain",
  "Indian Chief",
  "Indian Roadmaster",
  "Indian Scout",
  "Indian Springfield",
  
  // Kawasaki (バイク)
  "Kawasaki Concours 14",
  "Kawasaki KLX450R",
  "Kawasaki KLR650",
  "Kawasaki KX450F",
  "Kawasaki Ninja 300",
  "Kawasaki Ninja 400",
  "Kawasaki Ninja ZX-6R",
  "Kawasaki Ninja ZX-10R",
  "Kawasaki Versys 1000",
  "Kawasaki Versys 650",
  "Kawasaki Vulcan 900",
  "Kawasaki Vulcan S",
  "Kawasaki Z400",
  "Kawasaki Z650",
  "Kawasaki Z900",
  
  // Koenigsegg (車)
  "Koenigsegg Agera",
  "Koenigsegg Jesko",
  "Koenigsegg Regera",
  
  // KTM (バイク)
  "KTM 350 EXC",
  "KTM 390 Duke",
  "KTM 450 EXC",
  "KTM 790 Adventure",
  "KTM 890 Duke",
  "KTM 1290 Super Adventure",
  "KTM 1290 Super Duke",
  
  // Lamborghini (車)
  "Lamborghini Aventador",
  "Lamborghini Countach",
  "Lamborghini Diablo",
  "Lamborghini Huracan",
  "Lamborghini Murcielago",
  "Lamborghini Urus",
  
  // Lexus (車)
  "Lexus GS",
  "Lexus IS200",
  "Lexus IS300",
  "Lexus IS350",
  "Lexus LC",
  "Lexus LFA",
  "Lexus LS",
  "Lexus RC",
  
  // Mazda (車)
  "Mazda 3",
  "Mazda 6",
  "Mazda CX-5",
  "Mazda MX-5 NA",
  "Mazda MX-5 NB",
  "Mazda MX-5 NC",
  "Mazda MX-5 ND",
  "Mazda RX-7 FC3S",
  "Mazda RX-7 FD3S",
  "Mazda RX-8",
  
  // McLaren (車)
  "McLaren 720S",
  "McLaren F1",
  "McLaren P1",
  "McLaren Senna",
  "McLaren Speedtail",
  
  // Mercedes-Benz (車)
  "Mercedes-Benz AMG GT",
  "Mercedes-Benz C-Class",
  "Mercedes-Benz E-Class",
  "Mercedes-Benz S-Class",
  "Mercedes-Benz SL",
  "Mercedes-Benz SLK",
  
  // Mitsubishi (車)
  "Mitsubishi 3000GT",
  "Mitsubishi Eclipse",
  "Mitsubishi FTO",
  "Mitsubishi GTO",
  "Mitsubishi Lancer Evo III",
  "Mitsubishi Lancer Evo IV",
  "Mitsubishi Lancer Evo V",
  "Mitsubishi Lancer Evo VI",
  "Mitsubishi Lancer Evo VII",
  "Mitsubishi Lancer Evo VIII",
  "Mitsubishi Lancer Evo IX",
  "Mitsubishi Lancer Evo X",
  
  // Moto Guzzi (バイク)
  "Moto Guzzi California",
  "Moto Guzzi V7",
  "Moto Guzzi V9",
  "Moto Guzzi V85TT",
  
  // MV Agusta (バイク)
  "MV Agusta Brutale",
  "MV Agusta Dragster",
  "MV Agusta F3",
  "MV Agusta F4",
  "MV Agusta Stradale",
  "MV Agusta Turismo Veloce",
  
  // Nissan (車)
  "Nissan 180SX",
  "Nissan 350Z",
  "Nissan 370Z",
  "Nissan Fairlady Z",
  "Nissan GT-R",
  "Nissan S13",
  "Nissan S14",
  "Nissan S15",
  "Nissan Silvia",
  "Nissan Skyline R32",
  "Nissan Skyline R33",
  "Nissan Skyline R34",
  "Nissan Skyline R35",
  "Nissan Z",
  
  // Porsche (車)
  "Porsche 718",
  "Porsche 911",
  "Porsche 918",
  "Porsche Boxster",
  "Porsche Cayman",
  "Porsche Panamera",
  
  // Royal Enfield (バイク)
  "Royal Enfield Classic 350",
  "Royal Enfield Continental GT",
  "Royal Enfield Himalayan",
  "Royal Enfield Interceptor 650",
  
  // Subaru (車)
  "Subaru BRZ",
  "Subaru Forester",
  "Subaru Impreza GC8",
  "Subaru Impreza GD",
  "Subaru Impreza GE",
  "Subaru Impreza GV",
  "Subaru Legacy",
  "Subaru WRX STI",
  "Subaru XV",
  
  // Suzuki (車)
  "Suzuki Alto",
  "Suzuki Cappuccino",
  "Suzuki Jimny",
  "Suzuki Swift Sport ZC32S",
  "Suzuki Swift Sport ZC33S",
  "Suzuki Wagon R",
  
  // Suzuki (バイク)
  "Suzuki Boulevard M109R",
  "Suzuki DR-Z400S",
  "Suzuki GSX250R",
  "Suzuki GSX-R600",
  "Suzuki GSX-R750",
  "Suzuki GSX-R1000",
  "Suzuki Hayabusa",
  "Suzuki Katana",
  "Suzuki RM-Z450",
  "Suzuki SV650",
  "Suzuki SV1000",
  "Suzuki V-Strom 1000",
  "Suzuki V-Strom 650",
  
  // Toyota (車)
  "Toyota 86",
  "Toyota AE86",
  "Toyota Altezza",
  "Toyota Aristo",
  "Toyota Celica",
  "Toyota Chaser",
  "Toyota Cresta",
  "Toyota GR Corolla",
  "Toyota GR Yaris",
  "Toyota GR86",
  "Toyota Mark II",
  "Toyota MR2",
  "Toyota Soarer",
  "Toyota Supra A80",
  "Toyota Supra A90",
  
  // Triumph (バイク)
  "Triumph Bonneville",
  "Triumph Daytona 675",
  "Triumph Rocket 3",
  "Triumph Speed Triple",
  "Triumph Street Triple",
  "Triumph Thruxton",
  "Triumph Tiger 900",
  "Triumph Tiger 1200",
  
  // Volkswagen (車)
  "Volkswagen Golf GTI",
  "Volkswagen Golf R",
  "Volkswagen Passat",
  "Volkswagen Polo",
  "Volkswagen Scirocco",
  
  // Yamaha (バイク)
  "Yamaha FJR1300",
  "Yamaha MT-03",
  "Yamaha MT-07",
  "Yamaha MT-09",
  "Yamaha NMAX",
  "Yamaha TMAX",
  "Yamaha Tracer 900",
  "Yamaha Tenere 700",
  "Yamaha V-Star",
  "Yamaha VMAX",
  "Yamaha WR450F",
  "Yamaha XMAX",
  "Yamaha XSR700",
  "Yamaha XSR900",
  "Yamaha YZ450F",
  "Yamaha YZF-R1",
  "Yamaha YZF-R3",
  "Yamaha YZF-R6"
];

export const myGarage: MaintenanceRecord[] = [
  {
    id: "1",
    title: "マフラー交換",
    date: "2025-07-10",
    description: "スポーツマフラーに交換。音が良くなりました。",
    mileage: 50000,
    cost: 45000
  },
  {
    id: "2",
    title: "オイル交換 5W-30",
    date: "2025-07-25",
    description: "定期的なオイル交換。エンジンがスムーズに動くようになりました。",
    mileage: 52000,
    cost: 8000
  },
  {
    id: "3",
    title: "タイヤ交換 AD09",
    date: "2025-08-01",
    description: "サーキット用タイヤに交換。グリップ力が大幅に向上。",
    mileage: 53000,
    cost: 120000
  },
];

// スレッド広告用のデータ
export const threadAds = [
  {
    id: "ad1",
    title: "🏁 車・バイクパーツ特集",
    content: "限定クーポン配布中！スポーツマフラー、サスペンション、タイヤなど、車・バイクパーツが最大30%OFF！",
    author: "スポンサー",
    replies: 0,
    likes: 0,
    tags: ["広告", "パーツ", "セール"],
    createdAt: "今",
    type: "ad" as const,
    adType: "parts"
  },
  {
    id: "ad2",
    title: "🎬 車・バイク動画チャンネル",
    content: "新チャンネル開設！ドリフト、サーキット、ツーリング動画を毎日配信。チャンネル登録で限定コンテンツも！",
    author: "スポンサー",
    replies: 0,
    likes: 0,
    tags: ["広告", "動画", "チャンネル"],
    createdAt: "今",
    type: "ad" as const,
    adType: "video"
  },
  {
    id: "ad3",
    title: "🔧 車・バイク整備サービス",
    content: "プロの整備士があなたの愛車を徹底チェック！定期点検、カスタム作業、緊急修理まで対応。",
    author: "スポンサー",
    replies: 0,
    likes: 0,
    tags: ["広告", "整備", "サービス"],
    createdAt: "今",
    type: "ad" as const,
    adType: "service"
  },
  {
    id: "ad4",
    title: "📸 車・バイク写真コンテスト",
    content: "愛車の写真を投稿して豪華賞品をゲット！月間ベストフォトに選ばれると賞金10万円！",
    author: "スポンサー",
    replies: 0,
    likes: 0,
    tags: ["広告", "写真", "コンテスト"],
    createdAt: "今",
    type: "ad" as const,
    adType: "contest"
  },
  {
    id: "ad5",
    title: "🏁 ドリフトイベント開催",
    content: "初心者向けドリフトイベント開催！プロドライバーによる指導付き。安全にドリフトを楽しもう！",
    author: "スポンサー",
    replies: 0,
    likes: 0,
    tags: ["広告", "ドリフト", "イベント"],
    createdAt: "今",
    type: "ad" as const,
    adType: "event"
  }
];

export const threads: Thread[] = [
  {
    id: "1",
    title: "S13のドリフトセッティングについて",
    content: "S13でドリフトを始めたいのですが、初心者向けのセッティングを教えてください。現在はストック状態です。",
    author: "RevLinkユーザー",
    replies: 15,
    likes: 23,
    tags: ["S13", "ドリフト", "初心者"],
    createdAt: "2時間前",
    type: "question"
  },
  {
    id: "2",
    title: "EK9のサーキット走行レポート",
    content: "先週、EK9でサーキットを走ってきました。ハンドリングの良さに感動！タイムも自己ベストを更新できました。",
    author: "RevLinkユーザー",
    replies: 8,
    likes: 45,
    tags: ["EK9", "サーキット", "レポート"],
    createdAt: "1日前",
    type: "post"
  },
  {
    id: "3",
    title: "バイクのオイル交換時期について",
    content: "バイクのオイル交換は何kmごとに行っていますか？メーカー推奨と実際の使用状況で迷っています。",
    author: "バイク初心者",
    replies: 18,
    likes: 12,
    tags: ["バイク", "メンテナンス", "オイル"],
    createdAt: "10時間前",
    type: "question"
  },
  {
    id: "4",
    title: "R34のエンジン音を聞いてください",
    content: "R34の美しいエンジン音を録音しました。アイドルから高回転まで、ぜひ聞いてみてください！",
    author: "スカイライン愛好家",
    replies: 23,
    likes: 45,
    tags: ["R34", "エンジン音", "スカイライン"],
    createdAt: "8時間前",
    type: "post"
  },
  {
    id: "5",
    title: "Swift Sportのカスタムパーツ紹介",
    content: "Swift Sportに装着したカスタムパーツを紹介します。サスペンション、エアロ、エンジン周りをカスタムしました。",
    author: "RevLinkユーザー",
    replies: 12,
    likes: 67,
    tags: ["Swift Sport", "カスタム", "パーツ"],
    createdAt: "3日前",
    type: "post"
  },
  {
    id: "6",
    title: "ドリフト練習場のオススメ",
    content: "関東エリアでドリフト練習ができる場所を教えてください。初心者でも安心して練習できる場所が知りたいです。",
    author: "RevLinkユーザー",
    replies: 9,
    likes: 18,
    tags: ["ドリフト", "練習場", "関東"],
    createdAt: "5日前",
    type: "question"
  },
  {
    id: "7",
    title: "バイクツーリング 熊本編",
    content: "熊本までのツーリングに行ってきました。美しい風景と共に、おすすめのルートを紹介します。",
    author: "バイクツーリング",
    replies: 14,
    likes: 32,
    tags: ["バイク", "ツーリング", "熊本"],
    createdAt: "1週間前",
    type: "post"
  },
  {
    id: "8",
    title: "車の洗車方法について",
    content: "車の洗車でおすすめの方法や道具を教えてください。特にワックスがけのコツが知りたいです。",
    author: "RevLinkユーザー",
    replies: 6,
    likes: 15,
    tags: ["洗車", "ワックス", "メンテナンス"],
    createdAt: "2日前",
    type: "question"
  },
  {
    id: "9",
    title: "S13のエンジン音",
    content: "S13の美しいエンジン音をお届け。アイドルから高回転まで、ぜひ聞いてみてください！",
    author: "S13オーナー",
    replies: 11,
    likes: 78,
    tags: ["S13", "エンジン音", "動画"],
    createdAt: "4日前",
    type: "post"
  },
  {
    id: "10",
    title: "EK9のサーキット走行",
    content: "EK9でサーキットを走る様子。ハンドリングの良さが伝わります。",
    author: "EK9ライフ",
    replies: 7,
    likes: 67,
    tags: ["EK9", "サーキット", "動画"],
    createdAt: "6日前",
    type: "post"
  },
  {
    id: "11",
    title: "R34 ドリフト",
    content: "R34でドリフトを楽しむ様子。パワーとコントロールの絶妙なバランス。",
    author: "ドリフトマスター",
    replies: 19,
    likes: 156,
    tags: ["R34", "ドリフト", "動画"],
    createdAt: "1週間前",
    type: "post"
  },
  {
    id: "12",
    title: "オイル交換の基本",
    content: "車のオイル交換を分かりやすく解説します。初心者向けの手順を紹介。",
    author: "車メンテナンス",
    replies: 25,
    likes: 120,
    tags: ["オイル交換", "メンテナンス", "初心者"],
    createdAt: "2週間前",
    type: "post"
  },
  {
    id: "13",
    title: "タイヤの選び方について",
    content: "サーキット走行用のタイヤを選ぶ際のポイントを教えてください。グリップ力と耐久性のバランスが知りたいです。",
    author: "RevLinkユーザー",
    replies: 8,
    likes: 22,
    tags: ["タイヤ", "サーキット", "選び方"],
    createdAt: "1週間前",
    type: "question"
  },
  {
    id: "14",
    title: "バイクのカスタムについて",
    content: "バイクのカスタムでおすすめのパーツやメーカーを教えてください。見た目と性能の両方を重視したいです。",
    author: "RevLinkユーザー",
    replies: 11,
    likes: 28,
    tags: ["バイク", "カスタム", "パーツ"],
    createdAt: "3日前",
    type: "question"
  },
  {
    id: "15",
    title: "車の写真撮影のコツ",
    content: "車の写真を上手く撮るコツを教えてください。アングルやライティングのポイントが知りたいです。",
    author: "RevLinkユーザー",
    replies: 5,
    likes: 16,
    tags: ["写真", "撮影", "コツ"],
    createdAt: "4日前",
    type: "question"
  },
  // 整備関連の質問を追加
  {
    id: "16",
    title: "S13のブレーキパッド交換について",
    content: "S13のブレーキパッドを交換したいのですが、おすすめのメーカーや交換手順を教えてください。",
    author: "S13整備中",
    replies: 12,
    likes: 8,
    tags: ["S13", "ブレーキ", "パッド", "交換"],
    createdAt: "1日前",
    type: "question"
  },
  {
    id: "17",
    title: "EK9のサスペンション調整",
    content: "EK9のサスペンションを調整したいのですが、どのような設定がおすすめですか？",
    author: "EK9整備",
    replies: 15,
    likes: 23,
    tags: ["EK9", "サスペンション", "調整", "設定"],
    createdAt: "2日前",
    type: "question"
  },
  {
    id: "18",
    title: "R34のエンジンオイルについて",
    content: "R34のエンジンオイルを交換したいのですが、どのようなオイルがおすすめですか？",
    author: "R34オーナー",
    replies: 9,
    likes: 14,
    tags: ["R34", "エンジン", "オイル", "交換"],
    createdAt: "3日前",
    type: "question"
  },
  {
    id: "19",
    title: "バイクのバッテリー交換",
    content: "バイクのバッテリーが弱ってきたので交換したいのですが、どのようなバッテリーがおすすめですか？",
    author: "バイク整備",
    replies: 7,
    likes: 11,
    tags: ["バイク", "バッテリー", "交換", "電気"],
    createdAt: "4日前",
    type: "question"
  },
  {
    id: "20",
    title: "車のエアコン修理について",
    content: "車のエアコンが効かなくなってきたのですが、どのような原因が考えられますか？",
    author: "エアコン修理",
    replies: 18,
    likes: 25,
    tags: ["エアコン", "修理", "故障", "電気"],
    createdAt: "5日前",
    type: "question"
  },
  {
    id: "21",
    title: "Swift Sportのエアロパーツ",
    content: "Swift Sportにエアロパーツを付けたいのですが、どのようなパーツがおすすめですか？",
    author: "Swift整備",
    replies: 13,
    likes: 19,
    tags: ["Swift Sport", "エアロ", "パーツ", "カスタム"],
    createdAt: "6日前",
    type: "question"
  },
  {
    id: "22",
    title: "車のホイールアライメント調整",
    content: "車のホイールアライメントを調整したいのですが、どのような設定がおすすめですか？",
    author: "アライメント調整",
    replies: 11,
    likes: 16,
    tags: ["ホイール", "アライメント", "調整", "タイヤ"],
    createdAt: "1週間前",
    type: "question"
  },
  {
    id: "23",
    title: "バイクのチェーン交換",
    content: "バイクのチェーンを交換したいのですが、どのようなチェーンがおすすめですか？",
    author: "バイクチェーン",
    replies: 8,
    likes: 12,
    tags: ["バイク", "チェーン", "交換", "メンテナンス"],
    createdAt: "1週間前",
    type: "question"
  },
  {
    id: "24",
    title: "車のラジエーター修理",
    content: "車のラジエーターから水漏れがしているのですが、修理方法を教えてください。",
    author: "ラジエーター修理",
    replies: 14,
    likes: 21,
    tags: ["ラジエーター", "修理", "水漏れ", "冷却"],
    createdAt: "2週間前",
    type: "question"
  },
  {
    id: "25",
    title: "EK9のエンジンチューニング",
    content: "EK9のエンジンをチューニングしたいのですが、どのような方法がおすすめですか？",
    author: "EK9チューニング",
    replies: 22,
    likes: 35,
    tags: ["EK9", "エンジン", "チューニング", "カスタム"],
    createdAt: "2週間前",
    type: "question"
  }
];

export const videos: Video[] = [
  {
    id: "1",
    title: "S13 ドリフト走行",
    description: "S13でドリフト走行を楽しむ様子を撮影しました。アイドル音も最高です！",
    thumbnailUrl: "https://via.placeholder.com/320x180/374151/FFFFFF?text=S13+Drift",
    videoUrl: "https://example.com/video1.mp4",
    duration: "4:30",
    views: 1200,
    likes: 85,
    author: "S13オーナー",
    authorId: "user1",
    channelId: "channel1",
    uploadedAt: "1日前",
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
    status: 'active',
    tags: ['ドリフト', 'S13', '走行'],
    category: 'car'
  },
  {
    id: "2",
    title: "EK9 サーキット走行",
    description: "EK9でサーキットを走る様子。ハンドリングの良さが伝わります。",
    thumbnailUrl: "https://via.placeholder.com/320x180/374151/FFFFFF?text=EK9+Circuit",
    videoUrl: "https://example.com/video2.mp4",
    duration: "5:12",
    views: 856,
    likes: 67,
    author: "EK9ライフ",
    authorId: "user2",
    channelId: "channel2",
    uploadedAt: "2日前",
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    status: 'active',
    tags: ['サーキット', 'EK9', '走行'],
    category: 'car'
  },
  {
    id: "3",
    title: "R34 ドリフト",
    description: "R34でドリフトを楽しむ様子。パワーとコントロールの絶妙なバランス。",
    thumbnailUrl: "https://via.placeholder.com/320x180/374151/FFFFFF?text=R34+Drift",
    videoUrl: "https://example.com/video3.mp4",
    duration: "3:45",
    views: 2100,
    likes: 156,
    author: "ドリフトマスター",
    authorId: "user3",
    channelId: "channel3",
    uploadedAt: "3日前",
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    status: 'active',
    tags: ['ドリフト', 'R34', '走行'],
    category: 'car'
  },
  {
    id: "4",
    title: "バイクツーリング 熊本編",
    description: "熊本までのツーリング動画。美しい風景と共にお届けします。",
    thumbnailUrl: "https://via.placeholder.com/320x180/374151/FFFFFF?text=Bike+Tour",
    videoUrl: "https://example.com/video4.mp4",
    duration: "8:20",
    views: 450,
    likes: 32,
    author: "バイクツーリング",
    authorId: "user4",
    channelId: "channel4",
    uploadedAt: "4日前",
    createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
    status: 'active',
    tags: ['ツーリング', 'バイク', '熊本'],
    category: 'bike'
  },
  {
    id: "5",
    title: "オイル交換の基本",
    description: "車のオイル交換を分かりやすく解説します。初心者向け。",
    thumbnailUrl: "https://via.placeholder.com/320x180/374151/FFFFFF?text=Oil+Change",
    videoUrl: "https://example.com/video5.mp4",
    duration: "12:30",
    views: 1800,
    likes: 120,
    author: "車メンテナンス",
    authorId: "user5",
    channelId: "channel5",
    uploadedAt: "5日前",
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    status: 'active',
    tags: ['メンテナンス', 'オイル交換', '初心者'],
    category: 'maintenance'
  },
  {
    id: "6",
    title: "S13 エンジン音",
    description: "S13の美しいエンジン音をお届け。アイドルから高回転まで。",
    thumbnailUrl: "https://via.placeholder.com/320x180/374151/FFFFFF?text=S13+Sound",
    videoUrl: "https://example.com/video6.mp4",
    duration: "2:15",
    views: 950,
    likes: 78,
    author: "S13オーナー",
    authorId: "user1",
    channelId: "channel1",
    uploadedAt: "6日前",
    createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
    status: 'active',
    tags: ['エンジン音', 'S13', 'サウンド'],
    category: 'car'
  }
];

export const currentUser: User = {
  id: "1",
  name: "RevLinkユーザー",
  avatar: "https://via.placeholder.com/40x40/3B82F6/FFFFFF?text=U",
  cars: carModels.slice(0, 4), // S13, EK9, Swift Sport, R34
  interestedCars: ["RX-7 FD3S", "Trueno AE86", "S2000 AP1", "Supra A80"] // 文字列配列に変更
};

export const channels: Channel[] = [
  {
    id: "channel1",
    name: "S13オーナー",
    avatar: "https://via.placeholder.com/40x40/EF4444/FFFFFF?text=S",
    subscriberCount: 1250,
    isSubscribed: true,
    description: "S13愛好家のためのチャンネル。ドリフト走行やメンテナンス動画を配信"
  },
  {
    id: "channel2",
    name: "EK9ライフ",
    avatar: "https://via.placeholder.com/40x40/10B981/FFFFFF?text=E",
    subscriberCount: 890,
    isSubscribed: true,
    description: "EK9の魅力を伝えるチャンネル。サーキット走行やカスタム情報"
  },
  {
    id: "channel3",
    name: "ドリフトマスター",
    avatar: "https://via.placeholder.com/40x40/8B5CF6/FFFFFF?text=D",
    subscriberCount: 2100,
    isSubscribed: false,
    description: "ドリフトテクニックと車両紹介。初心者から上級者まで"
  },
  {
    id: "channel4",
    name: "バイクツーリング",
    avatar: "https://via.placeholder.com/40x40/F59E0B/FFFFFF?text=B",
    subscriberCount: 650,
    isSubscribed: false,
    description: "バイクツーリングの魅力を伝える。ルート紹介や風景動画"
  },
  {
    id: "channel5",
    name: "車メンテナンス",
    avatar: "https://via.placeholder.com/40x40/06B6D4/FFFFFF?text=M",
    subscriberCount: 3200,
    isSubscribed: true,
    description: "車のメンテナンス方法を分かりやすく解説"
  }
];

export const notifications: Notification[] = [
  {
    id: "1",
    title: "いいねがつきました",
    content: "S13のドリフトセッティングについての投稿にいいねがつきました",
    type: "like",
    isRead: false,
    time: "5分前"
  },
  {
    id: "2",
    title: "返信がつきました",
    content: "EK9のサーキット走行レポートに返信がつきました",
    type: "reply",
    isRead: false,
    time: "1時間前"
  },
  {
    id: "3",
    title: "フォローされました",
    content: "ドリフトマスターさんがあなたをフォローしました",
    type: "follow",
    isRead: true,
    time: "3時間前"
  },
  {
    id: "4",
    title: "メンテナンスリマインダー",
    content: "S13のオイル交換時期が近づいています",
    type: "maintenance",
    isRead: true,
    time: "1日前"
  }
];

export const privateGroups: PrivateGroup[] = [
  {
    id: "1",
    name: "S13愛好会",
    memberCount: 45
  },
  {
    id: "2",
    name: "ドリフト初心者",
    memberCount: 23
  },
  {
    id: "3",
    name: "サーキット走行",
    memberCount: 67
  }
];

export const quickActions: QuickAction[] = [
  {
    id: "post",
    title: "投稿",
    icon: "Activity",
    color: "bg-primary"
  },
  {
    id: "question",
    title: "質問",
    icon: "MessageSquare",
    color: "bg-yellow-500"
  },
  {
    id: "maintenance",
    title: "整備記録",
    icon: "Wrench",
    color: "bg-green-500"
  }
];

export const postTemplates = [
  {
    id: "general",
    title: "スレッド",
    description: "車やバイクについて投稿しましょう",
    icon: "Car"
  },
  {
    id: "question",
    title: "質問",
    description: "車やバイクについて質問しましょう",
    icon: "HelpCircle"
  },
  {
    id: "maintenance",
    title: "整備記録",
    description: "整備の記録を共有しましょう",
    icon: "Wrench"
  },
  {
    id: "touring",
    title: "ツーリングチャット",
    description: "ツーリングの募集をしましょう",
    icon: "Users"
  }
];

export const maintenancePosts: MaintenancePost[] = [
  {
    id: "mp1",
    title: "S13 オイル交換",
    content: "S13のオイル交換を行いました。5W-30のモービル1を使用。エンジンがスムーズに動くようになりました。",
    author: "RevLinkユーザー",
    authorAvatar: "/images/avatars/user1.jpg",
    carModel: "Nissan S13",
    carImage: "/images/cars/s13.jpg",
    mileage: 50000,
    cost: 8000,
    workDate: "2025-01-15",
    category: "oil",
    tags: ["S13", "オイル交換", "メンテナンス"],
    likes: 12,
    comments: 5,
    createdAt: "2時間前",
    totalTime: "30分",
    difficulty: "easy",
    tools: ["ジャッキ", "レンチ", "オイルフィルターレンチ", "オイルパン"],
    parts: ["モービル1 5W-30", "オイルフィルター"],
    steps: [
      {
        id: "step1",
        order: 1,
        title: "車体を浮かせる",
        description: "ジャッキを使って車体を浮かせます。エンジンルームの下にオイルパンを置いておきます。",
        image: "/images/maintenance/step1.jpg",
        tips: "ジャッキの位置は車体の指定位置に合わせてください"
      },
      {
        id: "step2",
        order: 2,
        title: "オイルフィルターを外す",
        description: "オイルフィルターレンチを使って古いオイルフィルターを外します。オイルが垂れるので注意してください。",
        image: "/images/maintenance/step2.jpg",
        tips: "フィルターを外す前にオイルパンを準備しておく"
      },
      {
        id: "step3",
        order: 3,
        title: "ドレンプラグを外す",
        description: "エンジン下部のドレンプラグを外して古いオイルを抜きます。",
        image: "/images/maintenance/step3.jpg",
        tips: "プラグを外す際は熱いオイルに注意"
      },
      {
        id: "step4",
        order: 4,
        title: "新しいフィルターを装着",
        description: "新しいオイルフィルターにオイルを少し塗ってから装着します。",
        image: "/images/maintenance/step4.jpg",
        tips: "フィルターのゴムパッキンにオイルを塗ると密着性が向上"
      },
      {
        id: "step5",
        order: 5,
        title: "新しいオイルを注入",
        description: "新しいオイルをエンジンに注入します。オイルレベルゲージで適正量を確認してください。",
        image: "/images/maintenance/step5.jpg",
        tips: "少しずつ注入してオイルレベルを確認しながら"
      }
    ]
  },
  {
    id: "mp2",
    title: "EK9 サスペンション調整",
    content: "EK9のサスペンションを調整しました。コイルオーバーを1cm下げて、キャンバーも調整。ハンドリングが大幅に向上しました。",
    author: "EK9整備",
    authorAvatar: "/images/avatars/ek9-life.jpg",
    carModel: "Civic EK9",
    carImage: "/images/cars/ek9.jpg",
    mileage: 45000,
    cost: 150000,
    workDate: "2025-01-14",
    category: "suspension",
    tags: ["EK9", "サスペンション", "調整", "コイルオーバー"],
    likes: 28,
    comments: 12,
    createdAt: "1日前",
    totalTime: "2時間",
    difficulty: "medium",
    tools: ["ジャッキ", "レンチ", "トルクレンチ", "キャンバーゲージ"],
    parts: ["コイルオーバー", "キャンバー調整ボルト"],
    steps: [
      {
        id: "step1",
        order: 1,
        title: "車体を浮かせる",
        description: "ジャッキを使って車体を浮かせます。4輪すべてを浮かせて安定させます。",
        image: "/images/maintenance/step1.jpg",
        tips: "ジャッキスタンドも使用して安全を確保"
      },
      {
        id: "step2",
        order: 2,
        title: "ホイールを外す",
        description: "4輪すべてのホイールを外します。ボルトは紛失しないよう整理して保管してください。",
        image: "/images/maintenance/step2.jpg",
        tips: "ホイールボルトの順番を覚えておく"
      },
      {
        id: "step3",
        order: 3,
        title: "コイルオーバーを調整",
        description: "コイルオーバーの高さ調整リングを回して1cm下げます。左右均等に調整してください。",
        image: "/images/maintenance/step3.jpg",
        tips: "調整後は必ずトルクレンチで締め付け"
      },
      {
        id: "step4",
        order: 4,
        title: "キャンバーを調整",
        description: "キャンバー調整ボルトを緩めてキャンバー角を調整します。",
        image: "/images/maintenance/step4.jpg",
        tips: "キャンバーゲージで正確に測定"
      }
    ]
  },
  {
    id: "mp3",
    title: "R34 ブレーキパッド交換",
    content: "R34のブレーキパッドを交換しました。フェロードのスポーツパッドを使用。制動力が向上し、サーキット走行が楽しくなりました。",
    author: "R34オーナー",
    authorAvatar: "https://via.placeholder.com/40x40/8B5CF6/FFFFFF?text=R",
    carModel: "Skyline R34",
    carImage: "https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=320&h=180&fit=crop&crop=center",
    mileage: 35000,
    cost: 25000,
    workDate: "2025-01-13",
    category: "brake",
    tags: ["R34", "ブレーキ", "パッド", "フェロード"],
    likes: 35,
    comments: 8,
    createdAt: "2日前",
    totalTime: "1時間30分",
    difficulty: "medium",
    tools: ["ジャッキ", "レンチ", "ブレーキパッドプッシャー", "Cクランプ"],
    parts: ["フェロードスポーツパッド", "ブレーキクリーナー"],
    steps: [
      {
        id: "step1",
        order: 1,
        title: "車体を浮かせる",
        description: "ジャッキを使って車体を浮かせます。作業する側のホイールを外します。",
        image: "https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=400&h=300&fit=crop&crop=center",
        tips: "ブレーキ作業なので安全第一"
      },
      {
        id: "step2",
        order: 2,
        title: "キャリパーを外す",
        description: "ブレーキキャリパーのボルトを外してキャリパーを外します。",
        image: "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=400&h=300&fit=crop&crop=center",
        tips: "キャリパーを吊るしてホースを傷めない"
      },
      {
        id: "step3",
        order: 3,
        title: "古いパッドを外す",
        description: "古いブレーキパッドを外します。パッドの厚みを確認して交換時期を判断。",
        image: "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=400&h=300&fit=crop&crop=center",
        tips: "パッドの残り厚みを測定"
      },
      {
        id: "step4",
        order: 4,
        title: "ピストンを押し込む",
        description: "ブレーキパッドプッシャーを使ってピストンを押し込みます。",
        image: "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=400&h=300&fit=crop&crop=center",
        tips: "ブレーキフルードタンクの蓋を開けておく"
      },
      {
        id: "step5",
        order: 5,
        title: "新しいパッドを装着",
        description: "新しいブレーキパッドを装着してキャリパーを戻します。",
        image: "https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=400&h=300&fit=crop&crop=center",
        tips: "パッドの向きを確認して装着"
      }
    ]
  },
  {
    id: "mp4",
    title: "Swift Sport エアロパーツ装着",
    content: "Swift Sportにエアロパーツを装着しました。フロントスプリッター、サイドスカート、リアウィングを追加。見た目が格好良くなりました。",
    author: "Swift整備",
    authorAvatar: "https://via.placeholder.com/40x40/F59E0B/FFFFFF?text=S",
    carModel: "Swift Sport ZC32S",
    carImage: "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=320&h=180&fit=crop&crop=center",
    mileage: 28000,
    cost: 80000,
    workDate: "2025-01-12",
    category: "body",
    tags: ["Swift Sport", "エアロ", "パーツ", "カスタム"],
    likes: 42,
    comments: 15,
    createdAt: "3日前",
    totalTime: "3時間",
    difficulty: "hard",
    tools: ["ドリル", "レンチ", "シリコーン", "マスキングテープ"],
    parts: ["フロントスプリッター", "サイドスカート", "リアウィング"],
    steps: [
      {
        id: "step1",
        order: 1,
        title: "パーツの仮組み",
        description: "各エアロパーツを仮組みして位置を確認します。",
        image: "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=400&h=300&fit=crop&crop=center",
        tips: "マスキングテープで位置をマーク"
      },
      {
        id: "step2",
        order: 2,
        title: "ドリル穴を開ける",
        description: "パーツの取り付け位置にドリルで穴を開けます。",
        image: "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=400&h=300&fit=crop&crop=center",
        tips: "下穴から始めて徐々に大きく"
      },
      {
        id: "step3",
        order: 3,
        title: "フロントスプリッターを装着",
        description: "フロントスプリッターを装着してボルトで固定します。",
        image: "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=400&h=300&fit=crop&crop=center",
        tips: "左右均等に締め付ける"
      },
      {
        id: "step4",
        order: 4,
        title: "サイドスカートを装着",
        description: "サイドスカートを装着して両面テープとボルトで固定。",
        image: "https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=400&h=300&fit=crop&crop=center",
        tips: "両面テープで仮止めしてからボルト締め"
      },
      {
        id: "step5",
        order: 5,
        title: "リアウィングを装着",
        description: "リアウィングを装着してトランクリッドに固定します。",
        image: "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=400&h=300&fit=crop&crop=center",
        tips: "シーリング材で防水処理"
      }
    ]
  },
  {
    id: "mp5",
    title: "S13 マフラー交換",
    content: "S13のマフラーをスポーツマフラーに交換しました。音が良くなり、加速感も向上しました。",
    author: "RevLinkユーザー",
    authorAvatar: "https://via.placeholder.com/40x40/3B82F6/FFFFFF?text=U",
    carModel: "Nissan S13",
    carImage: "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=320&h=180&fit=crop&crop=center",
    mileage: 52000,
    cost: 45000,
    workDate: "2025-01-10",
    category: "custom",
    tags: ["S13", "マフラー", "スポーツ", "カスタム"],
    likes: 18,
    comments: 7,
    createdAt: "5日前",
    totalTime: "1時間",
    difficulty: "easy",
    tools: ["ジャッキ", "レンチ", "ペンチ", "WD-40"],
    parts: ["スポーツマフラー", "マフラーガスケット"],
    steps: [
      {
        id: "step1",
        order: 1,
        title: "車体を浮かせる",
        description: "ジャッキを使って車体を浮かせます。マフラー周りが作業しやすい高さに調整。",
        image: "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=400&h=300&fit=crop&crop=center",
        tips: "安全のためジャッキスタンドも使用"
      },
      {
        id: "step2",
        order: 2,
        title: "古いマフラーを外す",
        description: "古いマフラーのボルトを外して取り外します。錆びている場合はWD-40を使用。",
        image: "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=400&h=300&fit=crop&crop=center",
        tips: "ボルトが固い場合はペンチで補助"
      },
      {
        id: "step3",
        order: 3,
        title: "新しいマフラーを装着",
        description: "新しいスポーツマフラーを装着してボルトで固定します。",
        image: "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=400&h=300&fit=crop&crop=center",
        tips: "ガスケットを忘れずに装着"
      },
      {
        id: "step4",
        order: 4,
        title: "位置調整",
        description: "マフラーの位置を調整して車体に当たらないようにします。",
        image: "https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=400&h=300&fit=crop&crop=center",
        tips: "車体とのクリアランスを確認"
      }
    ]
  },
  {
    id: "mp6",
    title: "EK9 タイヤ交換",
    content: "EK9のタイヤをAD09に交換しました。グリップ力が大幅に向上し、サーキットでのタイムが良くなりました。",
    author: "EK9整備",
    authorAvatar: "https://via.placeholder.com/40x40/10B981/FFFFFF?text=E",
    carModel: "Civic EK9",
    carImage: "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=320&h=180&fit=crop&crop=center",
    mileage: 48000,
    cost: 120000,
    workDate: "2025-01-08",
    category: "tire",
    tags: ["EK9", "タイヤ", "AD09", "サーキット"],
    likes: 31,
    comments: 11,
    createdAt: "1週間前",
    totalTime: "1時間",
    difficulty: "easy",
    tools: ["ジャッキ", "レンチ", "タイヤゲージ"],
    parts: ["AD09 205/55R16", "バルブ"],
    steps: [
      {
        id: "step1",
        order: 1,
        title: "車体を浮かせる",
        description: "ジャッキを使って車体を浮かせます。4輪すべてを浮かせます。",
        image: "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=400&h=300&fit=crop&crop=center",
        tips: "安全のためジャッキスタンドを使用"
      },
      {
        id: "step2",
        order: 2,
        title: "ホイールを外す",
        description: "4輪すべてのホイールを外します。",
        image: "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=400&h=300&fit=crop&crop=center",
        tips: "ホイールボルトを整理して保管"
      },
      {
        id: "step3",
        order: 3,
        title: "タイヤを交換",
        description: "古いタイヤを外して新しいAD09を装着します。",
        image: "https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=400&h=300&fit=crop&crop=center",
        tips: "タイヤの向きを確認して装着"
      },
      {
        id: "step4",
        order: 4,
        title: "空気圧を調整",
        description: "新しいタイヤの空気圧を調整します。",
        image: "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=400&h=300&fit=crop&crop=center",
        tips: "タイヤゲージで正確に測定"
      }
    ]
  },
  {
    id: "mp7",
    title: "R34 エンジンチューニング",
    content: "R34のエンジンをチューニングしました。ECUの書き換えとエアフィルターの交換で、パワーが向上しました。",
    author: "R34オーナー",
    authorAvatar: "https://via.placeholder.com/40x40/8B5CF6/FFFFFF?text=R",
    carModel: "Skyline R34",
    carImage: "https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=320&h=180&fit=crop&crop=center",
    mileage: 38000,
    cost: 200000,
    workDate: "2025-01-05",
    category: "engine",
    tags: ["R34", "エンジン", "チューニング", "ECU"],
    likes: 67,
    comments: 23,
    createdAt: "1週間前",
    totalTime: "4時間",
    difficulty: "hard",
    tools: ["レンチ", "ドライバー", "ECUライター", "ダイノ"],
    parts: ["エアフィルター", "ECUチップ"],
    steps: [
      {
        id: "step1",
        order: 1,
        title: "バッテリーを外す",
        description: "作業前にバッテリーのマイナス端子を外します。",
        image: "https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=400&h=300&fit=crop&crop=center",
        tips: "安全のため必ずバッテリーを外す"
      },
      {
        id: "step2",
        order: 2,
        title: "エアフィルターを交換",
        description: "エアボックスを開けてエアフィルターを交換します。",
        image: "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=400&h=300&fit=crop&crop=center",
        tips: "新しいフィルターの向きを確認"
      },
      {
        id: "step3",
        order: 3,
        title: "ECUを取り外す",
        description: "ECUの取り付けボルトを外して取り外します。",
        image: "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=400&h=300&fit=crop&crop=center",
        tips: "コネクターを傷めないよう注意"
      },
      {
        id: "step4",
        order: 4,
        title: "ECUを書き換え",
        description: "ECUライターを使ってチューニングマップを書き込みます。",
        image: "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=400&h=300&fit=crop&crop=center",
        tips: "書き込み中は電源を切らない"
      },
      {
        id: "step5",
        order: 5,
        title: "ECUを装着",
        description: "書き換え完了後、ECUを元の位置に装着します。",
        image: "https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=400&h=300&fit=crop&crop=center",
        tips: "コネクターを確実に接続"
      }
    ]
  },
  {
    id: "mp8",
    title: "Swift Sport バッテリー交換",
    content: "Swift Sportのバッテリーを交換しました。新しいバッテリーでエンジンの始動が良くなりました。",
    author: "Swift整備",
    authorAvatar: "https://via.placeholder.com/40x40/F59E0B/FFFFFF?text=S",
    carModel: "Swift Sport ZC32S",
    carImage: "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=320&h=180&fit=crop&crop=center",
    mileage: 32000,
    cost: 15000,
    workDate: "2025-01-03",
    category: "electrical",
    tags: ["Swift Sport", "バッテリー", "交換", "電気"],
    likes: 8,
    comments: 3,
    createdAt: "2週間前",
    totalTime: "30分",
    difficulty: "easy",
    tools: ["レンチ", "バッテリーブラシ"],
    parts: ["バッテリー"],
    steps: [
      {
        id: "step1",
        order: 1,
        title: "マイナス端子を外す",
        description: "バッテリーのマイナス端子を外します。",
        image: "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=400&h=300&fit=crop&crop=center",
        tips: "必ずマイナスから外す"
      },
      {
        id: "step2",
        order: 2,
        title: "プラス端子を外す",
        description: "次にプラス端子を外します。",
        image: "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=400&h=300&fit=crop&crop=center",
        tips: "端子を傷めないよう注意"
      },
      {
        id: "step3",
        order: 3,
        title: "古いバッテリーを外す",
        description: "バッテリー固定金具を外して古いバッテリーを取り外します。",
        image: "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=400&h=300&fit=crop&crop=center",
        tips: "バッテリーは重いので注意"
      },
      {
        id: "step4",
        order: 4,
        title: "新しいバッテリーを装着",
        description: "新しいバッテリーを装着して固定金具で固定します。",
        image: "https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=400&h=300&fit=crop&crop=center",
        tips: "端子の向きを確認して装着"
      }
    ]
  }
];

// 気になる車種に関するスレッドを追加
export const interestedCarThreads: Thread[] = [
  {
    id: "ic1",
    title: "RX-7 FD3Sの購入を検討中",
    content: "RX-7 FD3Sの購入を検討しています。ロータリーエンジンの魅力に惹かれていますが、メンテナンスについて不安があります。",
    author: "ロータリー愛好家",
    replies: 12,
    likes: 25,
    tags: ["RX-7", "FD3S", "ロータリー", "購入検討"],
    createdAt: "3時間前",
    type: "question"
  },
  {
    id: "ic2",
    title: "AE86のドリフトセッティング",
    content: "AE86でドリフトを始めたいのですが、初心者向けのセッティングを教えてください。",
    author: "ドリフト初心者",
    replies: 18,
    likes: 32,
    tags: ["AE86", "ドリフト", "初心者", "セッティング"],
    createdAt: "1日前",
    type: "question"
  },
  {
    id: "ic3",
    title: "S2000のサーキット走行",
    content: "S2000でサーキットを走る様子を撮影しました。高回転エンジンの魅力が伝わります。",
    author: "S2000オーナー",
    replies: 8,
    likes: 45,
    tags: ["S2000", "サーキット", "高回転", "動画"],
    createdAt: "2日前",
    type: "post"
  },
  {
    id: "ic4",
    title: "Supra A80のチューニング",
    content: "Supra A80のチューニングについて質問です。どの程度までチューニングできますか？",
    author: "Supra愛好家",
    replies: 15,
    likes: 28,
    tags: ["Supra", "A80", "チューニング", "パワー"],
    createdAt: "3日前",
    type: "question"
  }
];

// 気になる車種の整備記録を追加
export const interestedCarMaintenancePosts: MaintenancePost[] = [
  {
    id: "icmp1",
    title: "RX-7 FD3S エンジンオイル交換",
    content: "RX-7 FD3Sのエンジンオイル交換を行いました。ロータリーエンジン専用のオイルを使用。",
    author: "ロータリー整備",
    authorAvatar: "https://via.placeholder.com/40x40/EF4444/FFFFFF?text=R",
    carModel: "RX-7 FD3S",
    carImage: "https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=320&h=180&fit=crop&crop=center",
    mileage: 65000,
    cost: 12000,
    workDate: "2025-01-10",
    category: "oil",
    tags: ["RX-7", "FD3S", "ロータリー", "オイル交換"],
    likes: 15,
    comments: 6,
    createdAt: "1週間前",
    totalTime: "45分",
    difficulty: "medium",
    tools: ["レンチ", "オイルフィルターレンチ", "オイルパン"],
    parts: ["ロータリー専用オイル", "オイルフィルター"],
    steps: [
      {
        id: "step1",
        order: 1,
        title: "エンジンルームを開ける",
        description: "RX-7のエンジンルームを開けて、ロータリーエンジンを確認します。",
        image: "https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=400&h=300&fit=crop&crop=center",
        tips: "ロータリーエンジンは通常のエンジンと構造が異なるので注意"
      },
      {
        id: "step2",
        order: 2,
        title: "オイルフィルターを外す",
        description: "ロータリーエンジン専用のオイルフィルターを外します。",
        image: "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=400&h=300&fit=crop&crop=center",
        tips: "専用のオイルフィルターを使用する"
      }
    ]
  },
  {
    id: "icmp2",
    title: "AE86 サスペンション調整",
    content: "AE86のサスペンションを調整しました。ドリフト用のセッティングに変更。",
    author: "AE86整備",
    authorAvatar: "https://via.placeholder.com/40x40/10B981/FFFFFF?text=A",
    carModel: "Trueno AE86",
    carImage: "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=320&h=180&fit=crop&crop=center",
    mileage: 85000,
    cost: 80000,
    workDate: "2025-01-08",
    category: "suspension",
    tags: ["AE86", "サスペンション", "ドリフト", "調整"],
    likes: 22,
    comments: 9,
    createdAt: "1週間前",
    totalTime: "2時間30分",
    difficulty: "medium",
    tools: ["ジャッキ", "レンチ", "トルクレンチ"],
    parts: ["コイルオーバー", "キャンバー調整ボルト"],
    steps: [
      {
        id: "step1",
        order: 1,
        title: "車体を浮かせる",
        description: "AE86の車体を浮かせて、サスペンション作業の準備をします。",
        image: "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=400&h=300&fit=crop&crop=center",
        tips: "古い車なのでジャッキの位置に注意"
      },
      {
        id: "step2",
        order: 2,
        title: "サスペンションを調整",
        description: "ドリフト用のサスペンションセッティングに調整します。",
        image: "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=400&h=300&fit=crop&crop=center",
        tips: "ドリフト用は硬めのセッティング"
      }
    ]
  },
  {
    id: "icmp3",
    title: "S2000 エアフィルター交換",
    content: "S2000のエアフィルターを交換しました。高回転エンジンに最適なフィルターを使用。",
    author: "S2000整備",
    authorAvatar: "https://via.placeholder.com/40x40/8B5CF6/FFFFFF?text=S",
    carModel: "S2000 AP1",
    carImage: "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=320&h=180&fit=crop&crop=center",
    mileage: 42000,
    cost: 15000,
    workDate: "2025-01-05",
    category: "engine",
    tags: ["S2000", "エアフィルター", "高回転", "交換"],
    likes: 18,
    comments: 7,
    createdAt: "2週間前",
    totalTime: "30分",
    difficulty: "easy",
    tools: ["ドライバー", "レンチ"],
    parts: ["高流量エアフィルター"],
    steps: [
      {
        id: "step1",
        order: 1,
        title: "エアボックスを開ける",
        description: "S2000のエアボックスを開けて、古いエアフィルターを取り外します。",
        image: "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=400&h=300&fit=crop&crop=center",
        tips: "高回転エンジンなので専用フィルターを使用"
      },
      {
        id: "step2",
        order: 2,
        title: "新しいフィルターを装着",
        description: "高流量エアフィルターを装着して、エアボックスを閉じます。",
        image: "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=400&h=300&fit=crop&crop=center",
        tips: "フィルターの向きを確認して装着"
      }
    ]
  },
  {
    id: "icmp4",
    title: "Supra A80 ブレーキパッド交換",
    content: "Supra A80のブレーキパッドを交換しました。スポーツパッドで制動力向上。",
    author: "Supra整備",
    authorAvatar: "https://via.placeholder.com/40x40/F59E0B/FFFFFF?text=S",
    carModel: "Supra A80",
    carImage: "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=320&h=180&fit=crop&crop=center",
    mileage: 55000,
    cost: 35000,
    workDate: "2025-01-03",
    category: "brake",
    tags: ["Supra", "A80", "ブレーキ", "パッド"],
    likes: 25,
    comments: 11,
    createdAt: "2週間前",
    totalTime: "1時間45分",
    difficulty: "medium",
    tools: ["ジャッキ", "レンチ", "ブレーキパッドプッシャー"],
    parts: ["スポーツブレーキパッド", "ブレーキクリーナー"],
    steps: [
      {
        id: "step1",
        order: 1,
        title: "車体を浮かせる",
        description: "Supraの車体を浮かせて、ブレーキ作業の準備をします。",
        image: "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=400&h=300&fit=crop&crop=center",
        tips: "重い車なので安全に作業"
      },
      {
        id: "step2",
        order: 2,
        title: "ブレーキパッドを交換",
        description: "スポーツブレーキパッドに交換して、制動力を向上させます。",
        image: "https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=400&h=300&fit=crop&crop=center",
        tips: "パワフルなエンジンに合わせたブレーキ"
      }
    ]
  }
];

// 車種一覧データ
export const carList: string[] = [
  // 日産
  "Nissan S13", "Nissan S14", "Nissan S15", "Nissan R32", "Nissan R33", "Nissan R34", "Nissan R35",
  "Nissan 180SX", "Nissan Silvia", "Nissan Skyline", "Nissan Fairlady Z", "Nissan GT-R",
  // ホンダ
  "Civic EK9", "Civic EG6", "Civic EF9", "Civic Type R", "Integra Type R", "S2000 AP1", "S2000 AP2",
  "NSX NA1", "NSX NA2", "Prelude", "Accord", "CR-X",
  // トヨタ
  "Trueno AE86", "Levin AE86", "Supra A70", "Supra A80", "MR2 SW20", "MR2 ZZW30", "Celica",
  "Chaser", "Mark II", "Cresta", "Soarer", "Aristo",
  // マツダ
  "RX-7 FC3S", "RX-7 FD3S", "RX-8", "MX-5 NA", "MX-5 NB", "MX-5 NC", "MX-5 ND",
  // スバル
  "Impreza GC8", "Impreza GD", "Impreza GR", "WRX STI", "Legacy", "Forester",
  // 三菱
  "Lancer Evolution I", "Lancer Evolution II", "Lancer Evolution III", "Lancer Evolution IV",
  "Lancer Evolution V", "Lancer Evolution VI", "Lancer Evolution VII", "Lancer Evolution VIII",
  "Lancer Evolution IX", "Lancer Evolution X", "3000GT", "GTO",
  // スズキ
  "Swift Sport ZC32S", "Swift Sport ZC33S", "Cappuccino", "Jimny",
  // その他
  "BMW E30", "BMW E36", "BMW E46", "BMW E92", "BMW M3", "BMW M5",
  "Mercedes-Benz 190E", "Mercedes-Benz C-Class", "Mercedes-Benz E-Class",
  "Audi A4", "Audi S4", "Audi RS4", "Audi TT",
  "Volkswagen Golf GTI", "Volkswagen Golf R", "Volkswagen Scirocco",
  "Ford Mustang", "Ford Focus RS", "Ford Fiesta ST",
  "Chevrolet Camaro", "Chevrolet Corvette",
  "Dodge Challenger", "Dodge Charger",
  "Porsche 911", "Porsche Cayman", "Porsche Boxster",
  "Ferrari F40", "Ferrari F50", "Ferrari 360", "Ferrari 430",
  "Lamborghini Countach", "Lamborghini Diablo", "Lamborghini Gallardo",
  "McLaren F1", "McLaren 720S", "McLaren P1"
];
