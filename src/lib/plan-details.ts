import type { Language } from "@/lib/translations";
import type { Plan } from "@/lib/design-modes";
import { groupLimit } from "@/lib/plans";
import { reminderCopy } from "./reminder-copy";
import { planReadingLines } from './today-access-copy';
import { planBenefits } from './plan-benefits';

type Detail = { label: string; topPlan: string; items: Record<Plan, string[]> };

/** Tap-to-open "benefits & how to use" copy for each plan card. Upgrades remain preview-only. */
const baseDetails: Record<Language, Detail> = {
  ja: {
    label: "具体的なメリットと使い方", topPlan: "最高峰プランをご利用中です。すべての特典が解放されています。",
    items: {
      free: ["【自分を知る入口】「あなたの特性」で生まれ持った強み・つまずきやすい癖を言語化。自己紹介や就活・転職の自己分析にもそのまま使えます。", "【毎日の羅針盤】今日の占いの基本4項目で、朝1分で一日の過ごし方の指針が手に入ります。", "【AIをお試し】アゴルメン相談室・相性診断を1日1回ずつ。悩みを言葉にするだけで心が軽くなる体験を。", "【星音のBGMを試聴】528Hzを20秒試聴し、音で気分を整える感覚を体験できます。"],
      standard: ["【迷いを減らす】相談室・相性診断が1日3回に。仕事・恋愛・ファミリーなど複数のテーマを同じ日に深掘りでき、決断のスピードが上がります。", "【暮らしに活かす】買い物ガイドと健康アドバイスで、服選び・贈り物・体調管理など日々の小さな選択が自分らしく整います。", "【計画が立てやすい】地球暦を前後1ヶ月表示。商談・旅行・記念日の候補日を先回りで押さえられます。", "【大切な人を理解】ファミリー登録でパートナーやファミリーの傾向を把握し、すれ違いを未然に防ぎます。"],
      vip: ["【相談し放題に近い安心感】相談室・相性診断が1日10回。声での読み上げで、移動中や家事中も鑑定を“聴いて”受け取れます。", "【運の波に乗る】今月の3ラッキー、生まれ持った方位タイプと今年の吉方位、対人ガイドで、引越し・旅行・大事な面談のタイミングを戦略的に選べます。", "【一生ものの作品】高画質「バースカラー曼陀羅」「出生宇宙創生図」を壁紙保存・SNS共有。365日のバイオリズムで好調日・休む日を可視化し、無理のない自己管理を。"],
      b2b: ["【関係を見える化】ファミリー・友人・仕事仲間を登録し、全員のリズムを重ねて確認。相性の良い組み合わせや衝突しやすい時期が一目でわかります。", "【チーム運営の武器】同時診断・人員選抜・1on1トリセツなど組織コンサル機能で、配置・声かけ・会議の日程決めに根拠が生まれます。", "【大切な日を逃さない】365日ファミリーロードマップで記念日・挑戦日の候補を把握。相談室・相性診断は1日30回まで。"],
      "b2b-premium": ["【制限なし】相談室・相性診断が回数無制限。経営判断・人事・ファミリーの重要局面も、納得いくまで何度でも検証できます。", "【100名規模を俯瞰】大型組織コンサルにフル対応。部署・一族・コミュニティ全体のバランスと相性マップを一望できます。", "【優先AI処理】混雑時も優先的に応答。すべての特典を含む最上位の羅針盤です。"],
    },
  },
  en: {
    label: "Benefits & how to use", topPlan: "You're enjoying the flagship plan — every benefit is unlocked.",
    items: {
      free: ["[Know yourself] Your traits put your natural strengths and habits into words — handy for self-introductions and career reflection.", "[Daily compass] Four daily fortune items give you a one-minute plan for the day.", "[Try the AI] Consultation and compatibility once a day each — feel lighter just by putting worries into words.", "[Sample Celestial BGM] Hear 528 Hz for 20 seconds and feel how sound resets your mood."],
      standard: ["[Decide faster] Consultation and compatibility 3/day each, so you can explore work, love and family on the same day.", "[Everyday choices] Shopping and health tips help with outfits, gifts and self-care.", "[Plan ahead] Earth Calendar ±1 month to secure good dates for meetings, trips and anniversaries.", "[Understand loved ones] Family registration reveals tendencies and prevents misunderstandings."],
      vip: ["[Near-unlimited support] Consultation and compatibility 10/day, with voice read-aloud while commuting or doing chores.", "[Ride your luck] Monthly lucky picks, birth direction type, this year's direction and relationship guide help time moves, trips and key meetings.", "[Lifelong art] Save and share high-resolution mandala and Cosmic Genesis art; a 365-day biorhythm shows when to push and when to rest."],
      b2b: ["[See relationships] Overlay everyone's rhythm to spot great pairings and friction periods at a glance.", "[Team toolkit] Group diagnosis, member selection and 1-on-1 guides give evidence for roles, feedback and scheduling.", "[Never miss key dates] Family 365-day roadmap; consultation and compatibility up to 30/day."],
      "b2b-premium": ["[No limits] Unlimited consultation and compatibility to test big business, HR and family decisions.", "[100-person overview] Full large-organization consulting with balance and compatibility maps.", "[Priority AI] Faster responses at busy times; the top tier with every benefit."],
    },
  },
  "zh-CN": {
    label: "具体优点与使用方法", topPlan: "您正在使用最高级方案，所有特权均已解锁。",
    items: {
      free: ["【认识自己】用「个人特质」把天生优势与习惯化为语言，可直接用于自我介绍与职业分析。", "【每日罗盘】今日运势4项，早上1分钟掌握一天的方向。", "【体验AI】AI咨询与契合诊断每天各1次，把烦恼说出口就轻松许多。", "【试听星音BGM】试听528Hz 20秒，感受用声音调整心情。"],
      standard: ["【更快决断】咨询与契合诊断各每天3次，同一天深挖工作、恋爱、家庭。", "【融入生活】购物指南与健康建议，让穿搭、送礼与身体管理更有自己的风格。", "【提前规划】地球历前后1个月，提前锁定商谈、旅行、纪念日的好日子。", "【理解重要的人】登记家人掌握其倾向，防止误会。"],
      vip: ["【安心随时咨询】咨询与契合诊断各每天10次，支持语音朗读，通勤或做家务时也能“听”鉴定。", "【顺势而行】本月3幸运、先天方位类型、今年吉方位与人际指南，助你选择搬家、旅行、重要面谈的时机。", "【一生的作品】高清曼陀罗与宇宙创生图可保存分享；365天生物节律显示该冲刺与该休息的日子。"],
      b2b: ["【关系可视化】叠加所有人的节律，一眼看出契合组合与易冲突时期。", "【团队利器】同时诊断、人员选拔、1on1说明书，为分工、沟通与日程提供依据。", "【不错过重要日子】家庭365天路线图；咨询与契合诊断每天最多30次。"],
      "b2b-premium": ["【无限制】咨询与契合诊断次数无限，重大经营、人事、家庭决策可反复验证。", "【俯瞰100人】完整支持大型组织咨询，一览平衡与契合地图。", "【优先AI处理】繁忙时优先响应，包含全部特权的最高方案。"],
    },
  },
  "zh-TW": {
    label: "具體優點與使用方式", topPlan: "您正在使用最高級方案，所有特權均已解鎖。",
    items: {
      free: ["【認識自己】用「個人特質」把天生優勢與習慣化為語言，可直接用於自我介紹與職涯分析。", "【每日羅盤】今日運勢4項，早上1分鐘掌握一天的方向。", "【體驗AI】AI諮詢與契合診斷每天各1次，把煩惱說出口就輕鬆許多。", "【試聽星音BGM】試聽528Hz 20秒，感受用聲音調整心情。"],
      standard: ["【更快決斷】諮詢與契合診斷各每天3次，同一天深挖工作、戀愛、家庭。", "【融入生活】購物指南與健康建議，讓穿搭、送禮與身體管理更有自己的風格。", "【提前規劃】地球曆前後1個月，提前鎖定商談、旅行、紀念日的好日子。", "【理解重要的人】登錄家人掌握其傾向，防止誤會。"],
      vip: ["【安心隨時諮詢】諮詢與契合診斷各每天10次，支援語音朗讀，通勤或做家事時也能「聽」鑑定。", "【順勢而行】本月3幸運、先天方位類型、今年吉方位與人際指南，助你選擇搬家、旅行、重要面談的時機。", "【一生的作品】高畫質曼陀羅與宇宙創生圖可保存分享；365天生物節律顯示該衝刺與該休息的日子。"],
      b2b: ["【關係可視化】疊加所有人的節律，一眼看出契合組合與易衝突時期。", "【團隊利器】同時診斷、人員選拔、1on1說明書，為分工、溝通與日程提供依據。", "【不錯過重要日子】家庭365天路線圖；諮詢與契合診斷每天最多30次。"],
      "b2b-premium": ["【無限制】諮詢與契合診斷次數無限，重大經營、人事、家庭決策可反覆驗證。", "【俯瞰100人】完整支援大型組織諮詢，一覽平衡與契合地圖。", "【優先AI處理】繁忙時優先回應，包含全部特權的最高方案。"],
    },
  },
  ko: {
    label: "구체적인 장점과 사용법", topPlan: "최상위 플랜을 이용 중입니다. 모든 혜택이 열려 있습니다.",
    items: {
      free: ["【나를 아는 입구】'나의 특성'으로 타고난 강점과 습관을 언어화. 자기소개·커리어 분석에 바로 활용.", "【매일의 나침반】오늘의 운세 4항목으로 아침 1분에 하루 방향을 잡습니다.", "【AI 체험】AI 상담·궁합 진단 하루 1회씩. 고민을 말로 꺼내는 것만으로 가벼워집니다.", "【별빛 BGM 미리듣기】528Hz를 20초 들어보며 소리로 기분을 정돈하는 감각을 체험."],
      standard: ["【빠른 결단】상담·궁합 각 하루 3회로 일·연애·가족을 같은 날 깊이 탐색.", "【생활에 활용】쇼핑 가이드와 건강 조언으로 옷·선물·컨디션 관리가 나답게.", "【미리 계획】지구력 전후 1개월로 미팅·여행·기념일 좋은 날을 선점.", "【소중한 사람 이해】가족 등록으로 성향을 파악해 오해를 예방."],
      vip: ["【든든한 상담】상담·궁합 각 하루 10회, 음성 읽기로 이동 중에도 '들으며' 감정.", "【운의 흐름 타기】이달의 3행운, 타고난 방위 타입과 올해 길방위, 대인 가이드로 이사·여행·중요 면담 타이밍을 선택.", "【평생의 작품】고화질 만다라·우주 창세도 저장·공유, 365일 바이오리듬으로 달릴 날과 쉴 날을 확인."],
      b2b: ["【관계 시각화】모두의 리듬을 겹쳐 잘 맞는 조합과 충돌 시기를 한눈에.", "【팀 운영 무기】동시 진단·인원 선발·1on1 가이드로 배치·소통·일정에 근거를.", "【중요한 날 놓치지 않기】패밀리 365일 로드맵, 상담·궁합 하루 최대 30회."],
      "b2b-premium": ["【무제한】상담·궁합 무제한으로 경영·인사·가족의 중요한 결정을 충분히 검증.", "【100명 조망】대형 조직 컨설팅 완전 지원, 균형과 궁합 지도를 한눈에.", "【우선 AI 처리】혼잡 시에도 우선 응답, 모든 혜택을 포함한 최상위 플랜."],
    },
  },
  es: {
    label: "Beneficios y cómo usarlo", topPlan: "Estás disfrutando del plan insignia: todas las ventajas están desbloqueadas.",
    items: {
      free: ["[Conócete] Tus rasgos ponen en palabras tus fortalezas y hábitos, útil para presentarte o reflexionar sobre tu carrera.", "[Brújula diaria] Cuatro elementos diarios te dan un plan del día en un minuto.", "[Prueba la IA] Consulta y compatibilidad una vez al día: poner las preocupaciones en palabras alivia.", "[Prueba la BGM celeste] Escucha 528 Hz durante 20 segundos."],
      standard: ["[Decide antes] Consulta y compatibilidad 3 al día para explorar trabajo, amor y familia el mismo día.", "[Día a día] Guía de compras y salud para ropa, regalos y autocuidado.", "[Planifica] Calendario de la Tierra ±1 mes para fijar buenas fechas.", "[Entiende a los tuyos] El registro familiar revela tendencias y evita malentendidos."],
      vip: ["[Apoyo constante] Consulta y compatibilidad 10 al día, con lectura en voz.", "[Aprovecha tu suerte] Suertes del mes, dirección natal, dirección del año y guía de relaciones para elegir mudanzas, viajes y reuniones.", "[Arte para siempre] Guarda y comparte arte en alta resolución; biorritmo de 365 días para saber cuándo avanzar y cuándo descansar."],
      b2b: ["[Relaciones visibles] Superpone los ritmos de todos para ver afinidades y épocas de roce.", "[Herramientas de equipo] Diagnóstico grupal, selección y guías 1 a 1 para decidir roles y fechas.", "[Fechas clave] Hoja de ruta familiar de 365 días; hasta 30 consultas al día."],
      "b2b-premium": ["[Sin límites] Consulta y compatibilidad ilimitadas para decisiones importantes.", "[Vista de 100 personas] Consultoría para grandes organizaciones con mapas de equilibrio.", "[IA prioritaria] Respuestas prioritarias; el nivel superior con todo incluido."],
    },
  },
  fr: {
    label: "Avantages et utilisation", topPlan: "Vous profitez de la formule suprême : tous les avantages sont débloqués.",
    items: {
      free: ["[Se connaître] Vos traits mettent en mots vos forces et habitudes, utile pour se présenter ou réfléchir à sa carrière.", "[Boussole du jour] Quatre éléments quotidiens pour orienter votre journée en une minute.", "[Essayer l’IA] Consultation et compatibilité une fois par jour : formuler ses soucis soulage.", "[Écouter la BGM céleste] 528 Hz pendant 20 secondes."],
      standard: ["[Décider plus vite] Consultation et compatibilité 3/jour pour explorer travail, amour et famille le même jour.", "[Au quotidien] Guide d’achats et conseils santé pour tenues, cadeaux et bien-être.", "[Anticiper] Calendrier terrestre ±1 mois pour réserver les bonnes dates.", "[Comprendre ses proches] Le registre familial révèle les tendances et évite les malentendus."],
      vip: ["[Soutien constant] Consultation et compatibilité 10/jour, avec lecture vocale.", "[Saisir sa chance] Chances du mois, direction natale, direction de l’année et guide relationnel pour choisir déménagements, voyages et rendez-vous.", "[Œuvres pour la vie] Art haute résolution à garder et partager ; biorythme sur 365 jours pour savoir quand foncer ou se reposer."],
      b2b: ["[Liens visibles] Superposez les rythmes de chacun pour voir affinités et périodes de friction.", "[Outils d’équipe] Diagnostic de groupe, sélection et guides 1-à-1 pour rôles et calendrier.", "[Dates clés] Feuille de route familiale sur 365 jours ; jusqu’à 30 consultations par jour."],
      "b2b-premium": ["[Sans limite] Consultation et compatibilité illimitées pour les grandes décisions.", "[Vue sur 100 personnes] Conseil pour grandes organisations avec cartes d’équilibre.", "[IA prioritaire] Réponses prioritaires ; la formule suprême avec tout inclus."],
    },
  },
};

const groupLine: Record<Language, (n: number) => string> = {
  ja: n => n ? `グループ登録は最大${n}件。ファミリー・職場・友人などをまとめ、グループカラーと調和度、平均リズムを確認できます。` : "グループ登録はスタンダード以上で利用できます（1件〜）。",
  en: n => n ? `Register up to ${n} group(s) to see a group color, harmony score and average rhythm.` : "Group registration starts with Standard (1 group).",
  "zh-CN": n => n ? `最多可登记${n}个群组，查看群组色、协调度与平均节律。` : "标准方案起可登记群组（1个起）。",
  "zh-TW": n => n ? `最多可登記${n}個群組，查看群組色、協調度與平均節律。` : "標準方案起可登記群組（1個起）。",
  ko: n => n ? `그룹을 최대 ${n}개 등록해 그룹 컬러·조화도·평균 리듬을 볼 수 있습니다.` : "그룹 등록은 스탠다드부터 가능합니다(1개부터).",
  es: n => n ? `Registra hasta ${n} grupo(s) y consulta su color, armonía y ritmo medio.` : "El registro de grupos empieza en Standard (1 grupo).",
  fr: n => n ? `Enregistrez jusqu'à ${n} groupe(s) : couleur, harmonie et rythme moyen.` : "Les groupes commencent avec Standard (1 groupe).",
};
/** Plan card details with the group-registration cap appended from `groupLimit`. */
export const planDetails: Record<Language, Detail> = Object.fromEntries(
  (Object.keys(baseDetails) as Language[]).map(lang => {
    const d = baseDetails[lang];
    const items = Object.fromEntries((Object.keys(d.items) as Plan[]).map(plan => [plan, [...planBenefits(plan,lang), ...planReadingLines(plan, lang), ...(plan !== "free" ? [reminderCopy[lang].fullBenefit] : []), ...(plan !== "free" && plan !== "standard" ? [reminderCopy[lang].vipBenefit] : []), groupLine[lang](groupLimit[plan])]])) as Record<Plan, string[]>;
    return [lang, { ...d, items }];
  }),
) as Record<Language, Detail>;
