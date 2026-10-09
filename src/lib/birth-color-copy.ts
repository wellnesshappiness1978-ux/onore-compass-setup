import type { Language } from "./translations";

export type BirthColorRole = "main" | "sub" | "money" | "work" | "love" | "health" | "mind";

type RoleCopy = { label: string; summary: string; detail: string };
type BirthColorCopy = {
  title: string;
  intro: string;
  open: string;
  locked: string;
  upgrade: string;
  dialogNote: string;
  roles: Record<BirthColorRole, RoleCopy>;
};

const roles = (
  main: RoleCopy, sub: RoleCopy, money: RoleCopy, work: RoleCopy,
  love: RoleCopy, health: RoleCopy, mind: RoleCopy,
): Record<BirthColorRole, RoleCopy> => ({ main, sub, money, work, love, health, mind });

export const birthColorCopy: Record<Language, BirthColorCopy> = {
  ja: {
    title: "あなたの7つのバースカラー", intro: "色は性格や未来を決めるものではなく、今の自分を見つめるための参考パレットです。カードをタップすると詳しい読み方を確認できます。", open: "詳しい特性を見る", locked: "Standard以上で詳細を表示", upgrade: "プランを見る", dialogNote: "色彩象徴に基づく参考解説です。健康・金運・対人関係への効果を保証するものではありません。",
    roles: roles(
      { label: "総合カラー", summary: "あなたの軸を映す色", detail: "七つの色をまとめる中心色です。迷ったときに、自分が何を大切にしたいのかを静かに思い出す目印として使えます。毎日触れる小物や待受画面に少量取り入れると、考えを切り替える合図になります。強さを足す色ではなく、今ある自分の感覚へ戻るための参考色です。" },
      { label: "サブカラー", summary: "軸をやわらかく支える色", detail: "総合カラーだけでは表しきれない、あなたの柔らかさや調整力を映す補助色です。服の差し色やペンなど、気負わず選べる物に取り入れると、いつもの自分に別の角度を加えるきっかけになります。無理に目立たせず、中心色と一緒に使うことで調和を楽しむ参考色です。" },
      { label: "マネーカラー", summary: "お金との向き合い方を整える色", detail: "収入を増やす効果を示す色ではなく、使う・貯める・選ぶというお金の行動を落ち着いて振り返るための色です。財布の中のカードケースや家計簿、買い物メモに取り入れると、勢いだけで決めず、自分の優先順位を確かめる小さな合図として活用できます。" },
      { label: "ワークカラー", summary: "集中と持ち味を意識する色", detail: "仕事や学びの場で、何に力を注ぐかを見直すための参考色です。能力や適職を決めるものではありません。ノート、ペン、デスク周りに一点置き、始める前に今日の目的を一つ言葉にすると、気持ちの切り替えに使えます。自分らしい進め方を思い出す目印です。" },
      { label: "ラブ＆人脈カラー", summary: "人とのつながりを見つめる色", detail: "恋愛運や相手の気持ちを左右する色ではなく、人と会うときの自分の姿勢を振り返るための参考色です。ハンカチやアクセサリー、名刺入れなどに取り入れ、話す前に相手の言葉を一度受け止める合図に。近づくことと距離を守ることの両方を大切にする色です。" },
      { label: "ヘルスカラー", summary: "休息の感覚を思い出す色", detail: "治療や体調改善を約束する色ではありません。忙しさの中で休むタイミングを思い出し、心地よい環境を選ぶための参考色です。タオル、寝具、カップ、植物の鉢など、くつろぐ場所に少量使うと、呼吸を整えたり画面から目を離したりする合図にできます。" },
      { label: "マインドカラー", summary: "内側の声を整理する色", detail: "気持ちを決めつけず、今どんなことが心に残っているかを確かめるための参考色です。スマホの壁紙や手帳の印に使い、迷いがあるときは『今わかっていること』を一つ書き出す合図に。感情を消すのではなく、急いで答えを出さずに眺め直す余白をつくる色です。" },
    ),
  },
  en: {
    title: "Your seven birth colors", intro: "These colors do not define your personality or future. Use them as a reflective palette, and tap a card for a closer look.", open: "View details", locked: "Details unlock with Standard", upgrade: "View plans", dialogNote: "A symbolic color reflection, not a promise of health, wealth, or relationship outcomes.",
    roles: roles(
      { label: "Overall color", summary: "A color for your center", detail: "The anchor that brings the seven colors together. Use it on something you touch often as a quiet cue to return to what matters to you when choices feel crowded." },
      { label: "Supporting color", summary: "A gentle support for your center", detail: "A secondary shade for flexibility and adjustment. Add it to a pen, accessory, or small detail to invite another angle without losing your central direction." },
      { label: "Money color", summary: "A cue for mindful money choices", detail: "This color does not create wealth. Use it on a wallet insert, budget page, or shopping list as a reminder to pause and check your priorities before spending or saving." },
      { label: "Work color", summary: "A cue for focus and contribution", detail: "A reflective color for work and study, not a measure of talent or career fit. Place it near your notes or desk and name one clear purpose before you begin." },
      { label: "Love & connection color", summary: "A cue for human connection", detail: "This color cannot change another person's feelings. Use it before meeting someone as a reminder to listen first, speak honestly, and respect both closeness and boundaries." },
      { label: "Rest color", summary: "A cue to notice your need for rest", detail: "This is not a treatment or health claim. Add it to a cup, towel, bedding, or plant pot as a gentle reminder to breathe, look away from the screen, and make room for recovery." },
      { label: "Mind color", summary: "A cue to sort inner thoughts", detail: "Use this color as a pause before rushing to an answer. A wallpaper or journal mark can prompt you to write down one thing you know and give unsettled feelings room to become clearer." },
    ),
  },
  "zh-CN": {
    title: "你的七种出生色", intro: "色彩不会决定性格或未来，而是帮助你观察当下的参考色盘。点击色卡可查看详细说明。", open: "查看详细特性", locked: "Standard以上可查看详情", upgrade: "查看方案", dialogNote: "这是色彩象征的参考说明，不保证健康、财运或人际效果。",
    roles: roles(
      { label: "综合色", summary: "映照内在中心", detail: "汇聚七种颜色的核心色。可用于常用小物或手机画面，在选择纷杂时提醒自己回到真正重视的事情。" }, { label: "辅助色", summary: "柔和支撑中心", detail: "补充综合色未能表达的弹性。可用于笔或服饰点缀，让你在守住方向的同时看见另一种角度。" }, { label: "金钱色", summary: "整理金钱选择", detail: "它不会带来财富。可放在钱包、账本或购物清单上，提醒自己在消费与储蓄前停一下，确认真正的优先顺序。" }, { label: "工作色", summary: "提醒专注与发挥", detail: "这是工作和学习的参考色，不判断能力或适合的职业。可放在书桌或笔记旁，开始前先说出今天最重要的一件事。" }, { label: "爱情与人脉色", summary: "观察人与人的连接", detail: "它不会改变他人的感情。见面前可把它当作提醒：先听完对方的话，诚实表达，同时尊重亲近与界限。" }, { label: "休息色", summary: "想起休息的需要", detail: "这不是治疗或健康效果。可用于杯子、毛巾、寝具或花盆，提醒自己放下屏幕、调整呼吸，为恢复留出空间。" }, { label: "心灵色", summary: "整理内在声音", detail: "用它提醒自己不要急着得出答案。可设为壁纸或手帐标记，先写下一件已经确定的事，让混乱的感受慢慢变清楚。" },
    ),
  },
  "zh-TW": {
    title: "你的七種出生色", intro: "色彩不會決定性格或未來，而是幫助你觀察當下的參考色盤。點選色卡可查看詳細說明。", open: "查看詳細特質", locked: "Standard以上可查看詳情", upgrade: "查看方案", dialogNote: "這是色彩象徵的參考說明，不保證健康、財運或人際效果。",
    roles: roles(
      { label: "綜合色", summary: "映照內在中心", detail: "匯聚七種顏色的核心色。可用於常用小物或手機畫面，在選擇紛雜時提醒自己回到真正重視的事情。" }, { label: "輔助色", summary: "柔和支撐中心", detail: "補充綜合色未能表達的彈性。可用於筆或服飾點綴，讓你在守住方向的同時看見另一種角度。" }, { label: "金錢色", summary: "整理金錢選擇", detail: "它不會帶來財富。可放在錢包、帳本或購物清單上，提醒自己在消費與儲蓄前停一下，確認真正的優先順序。" }, { label: "工作色", summary: "提醒專注與發揮", detail: "這是工作和學習的參考色，不判斷能力或適合的職業。可放在書桌或筆記旁，開始前先說出今天最重要的一件事。" }, { label: "愛情與人脈色", summary: "觀察人與人的連結", detail: "它不會改變他人的感情。見面前可把它當作提醒：先聽完對方的話，誠實表達，同時尊重親近與界線。" }, { label: "休息色", summary: "想起休息的需要", detail: "這不是治療或健康效果。可用於杯子、毛巾、寢具或花盆，提醒自己放下螢幕、調整呼吸，為恢復留出空間。" }, { label: "心靈色", summary: "整理內在聲音", detail: "用它提醒自己不要急著得出答案。可設為桌布或手帳標記，先寫下一件已經確定的事，讓混亂的感受慢慢變清楚。" },
    ),
  },
  ko: {
    title: "나의 일곱 가지 탄생색", intro: "색은 성격이나 미래를 정하지 않습니다. 지금의 나를 살피는 참고 팔레트이며, 카드를 누르면 자세한 설명을 볼 수 있습니다.", open: "자세한 특성 보기", locked: "Standard 이상에서 상세 보기", upgrade: "플랜 보기", dialogNote: "색채 상징에 따른 참고 설명이며 건강, 재물, 관계의 효과를 보장하지 않습니다.",
    roles: roles(
      { label: "종합 색상", summary: "나의 중심을 비추는 색", detail: "일곱 색을 모으는 중심색입니다. 선택이 복잡할 때 자주 쓰는 물건이나 화면에 두고, 내가 중요하게 여기는 것으로 돌아오는 신호로 활용해 보세요." }, { label: "보조 색상", summary: "중심을 부드럽게 돕는 색", detail: "종합 색상에 유연함을 더하는 색입니다. 펜이나 옷의 작은 포인트로 사용해 중심을 잃지 않으면서 다른 관점을 떠올리는 계기로 삼을 수 있습니다." }, { label: "금전 색상", summary: "돈에 대한 선택을 정돈하는 색", detail: "재물을 불러오는 색은 아닙니다. 지갑 속 카드나 가계부, 장보기 목록에 사용해 지출과 저축 전에 우선순위를 확인하는 신호로 활용하세요." }, { label: "업무 색상", summary: "집중과 기여를 떠올리는 색", detail: "능력이나 적성을 판단하지 않는 업무와 학습의 참고색입니다. 책상이나 노트 가까이에 두고 시작 전에 오늘의 한 가지 목적을 말해 보는 신호로 쓸 수 있습니다." }, { label: "사랑과 인연 색상", summary: "사람 사이의 연결을 살피는 색", detail: "상대의 마음을 바꾸는 색은 아닙니다. 누군가를 만나기 전 먼저 듣고 솔직히 말하며, 가까움과 경계를 함께 존중하는 태도를 떠올려 보세요." }, { label: "휴식 색상", summary: "쉬어야 할 때를 알아차리는 색", detail: "치료나 건강 효과를 뜻하지 않습니다. 컵, 수건, 침구나 화분에 더해 화면에서 눈을 떼고 호흡을 고르며 회복할 여백을 만드는 신호로 활용하세요." }, { label: "마음 색상", summary: "내면의 목소리를 정리하는 색", detail: "답을 서두르지 않도록 돕는 참고색입니다. 배경화면이나 다이어리 표시에 사용하고, 지금 확실히 아는 한 가지를 적어 복잡한 감정을 천천히 바라보세요." },
    ),
  },
  es: {
    title: "Tus siete colores de nacimiento", intro: "Los colores no definen tu personalidad ni tu futuro. Úsalos como una paleta de reflexión y toca una tarjeta para saber más.", open: "Ver rasgos", locked: "Detalles desde Standard", upgrade: "Ver planes", dialogNote: "Reflexión simbólica, sin promesas sobre salud, dinero o relaciones.",
    roles: roles(
      { label: "Color general", summary: "Un color para tu centro", detail: "Reúne los siete colores. Úsalo en algo cotidiano para volver a lo que de verdad valoras cuando las opciones se acumulan." }, { label: "Color de apoyo", summary: "Apoyo suave para tu centro", detail: "Añade flexibilidad al color general. Un detalle en un bolígrafo o accesorio puede abrir otra mirada sin perder tu dirección." }, { label: "Color del dinero", summary: "Una pausa para elegir con calma", detail: "No genera riqueza. Úsalo en la cartera, presupuesto o lista de compras para revisar prioridades antes de gastar o ahorrar." }, { label: "Color del trabajo", summary: "Una señal para concentrarte", detail: "No mide talento ni vocación. Ponlo cerca de tus notas y nombra un objetivo claro antes de empezar a trabajar o estudiar." }, { label: "Color de vínculos", summary: "Una señal para conectar", detail: "No cambia los sentimientos ajenos. Úsalo para recordar escuchar primero, hablar con honestidad y respetar cercanía y límites." }, { label: "Color del descanso", summary: "Una señal para notar el cansancio", detail: "No es un tratamiento. Úsalo en una taza, toalla o planta para respirar, apartar la vista de la pantalla y dejar espacio para recuperarte." }, { label: "Color de la mente", summary: "Una señal para ordenar pensamientos", detail: "Úsalo para no apresurar una respuesta. Una marca en el diario puede invitarte a escribir algo que ya sabes y dar claridad a lo que sientes." },
    ),
  },
  fr: {
    title: "Vos sept couleurs de naissance", intro: "Les couleurs ne définissent ni votre personnalité ni votre avenir. Utilisez-les comme palette de réflexion et touchez une carte pour en savoir plus.", open: "Voir les traits", locked: "Détails dès Standard", upgrade: "Voir les offres", dialogNote: "Lecture symbolique, sans promesse pour la santé, l’argent ou les relations.",
    roles: roles(
      { label: "Couleur globale", summary: "Une couleur pour votre centre", detail: "Elle réunit les sept couleurs. Placez-la sur un objet familier pour revenir à ce qui compte lorsque les choix deviennent nombreux." }, { label: "Couleur de soutien", summary: "Un soutien doux pour votre centre", detail: "Elle apporte de la souplesse à la couleur globale. Une touche sur un stylo ou un accessoire ouvre un autre regard sans perdre votre direction." }, { label: "Couleur de l’argent", summary: "Une pause pour choisir", detail: "Elle ne crée pas la richesse. Utilisez-la dans un portefeuille, un budget ou une liste pour vérifier vos priorités avant de dépenser ou d’épargner." }, { label: "Couleur du travail", summary: "Un repère pour vous concentrer", detail: "Elle ne mesure ni talent ni vocation. Placez-la près de vos notes et nommez un objectif clair avant de travailler ou d’étudier." }, { label: "Couleur des liens", summary: "Un repère pour la relation", detail: "Elle ne change pas les sentiments d’autrui. Utilisez-la pour vous rappeler d’écouter, de parler avec sincérité et de respecter proximité et limites." }, { label: "Couleur du repos", summary: "Un repère pour remarquer la fatigue", detail: "Ce n’est pas un traitement. Ajoutez-la à une tasse, une serviette ou une plante pour respirer, quitter l’écran des yeux et laisser place à la récupération." }, { label: "Couleur de l’esprit", summary: "Un repère pour trier vos pensées", detail: "Utilisez-la pour ne pas précipiter une réponse. Une marque dans un carnet peut vous inviter à noter ce que vous savez déjà et à laisser vos émotions s’éclaircir." },
    ),
  },
};