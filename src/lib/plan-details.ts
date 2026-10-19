import type { Language } from "@/lib/translations";
import type { Plan } from "@/lib/design-modes";
import { groupLimit } from "@/lib/plans";

type Detail = { label: string; showAll: string; hideLower: string; items: Record<Plan, string[]> };

/** Tap-to-open "benefits & how to use" copy for each plan card. Upgrades remain preview-only. */
const baseDetails: Record<Language, Detail> = {
  ja: {
    label: "具体的なメリットと使い方", showAll: "すべてのプランを表示", hideLower: "下位プランを隠す",
    items: {
      free: ["「あなたの特性」と今日の占いの基本4項目を毎日無料で閲覧。", "アゴルメン相談室・相性診断は1日1回ずつ試せます。", "まずはプロフィールを登録し、自分の傾向を知る入口に。"],
      standard: ["相談室は1日5回、相性診断は1日3回に。迷った日に複数回相談できます。", "買い物ガイド・健康アドバイスが加わり、日々の選択に活かせます。", "地球暦を前後1ヶ月さかのぼって予定づくりに使えます。"],
      vip: ["相談室は1日15回、相性診断は1日10回。声での読み上げにも対応。", "今月の3ラッキー、生まれ持った方位タイプと今年の方位、対人ガイドを解放。", "高画質アートの保存・共有と、個人のバイオリズム365日表示。"],
      b2b: ["家族やチームを登録し、全員のリズムを重ねて確認。", "ファミリーの365日ロードマップで大切な日の候補を把握。", "相談室・相性診断は1日30回まで利用できます。"],
      "b2b-premium": ["相談室・相性診断が回数無制限。", "登録枠を広げ、つながり全体を深く見渡せます。", "すべての特典を含む最上位の体験です。"],
    },
  },
  en: {
    label: "Benefits & how to use", showAll: "Show all plans", hideLower: "Hide lower plans",
    items: {
      free: ["Read your traits and four daily fortune items free every day.", "Try the consultation room and compatibility once a day each.", "Register your profile as the starting point to know yourself."],
      standard: ["Consultation: 5/day; compatibility: 3/day.", "Adds a shopping guide and health tips for daily choices.", "Browse the Earth Calendar ±1 month for planning."],
      vip: ["Consultation: 15/day; compatibility: 10/day, with voice read-aloud.", "Unlocks monthly lucky picks, birth direction type, this year's direction and relationship guide.", "Save and share high-resolution art, plus a 365-day personal biorhythm."],
      b2b: ["Register family or team and overlay everyone's rhythm.", "See candidate dates on the family 365-day roadmap.", "Consultation and compatibility up to 30 per day."],
      "b2b-premium": ["Unlimited consultation and compatibility.", "Larger roster to see your whole circle in depth.", "The top tier including every benefit."],
    },
  },
  "zh-CN": {
    label: "具体优点与使用方法", showAll: "显示全部方案", hideLower: "隐藏较低方案",
    items: {
      free: ["每天免费查看个人特质与今日运势的4个基本项目。", "AI咨询与契合诊断每天各可体验1次。", "先登记个人资料，作为了解自己的入口。"],
      standard: ["AI咨询每天5次，契合诊断每天3次。", "新增购物指南与健康建议，助力日常选择。", "可查看前后1个月的地球历用于计划。"],
      vip: ["AI咨询每天15次，契合诊断每天10次，支持语音朗读。", "解锁本月3幸运、先天方位类型与今年方位、人际指南。", "高清艺术保存与分享，以及365天个人生物节律。"],
      b2b: ["登记家人或团队，叠加查看所有人的节律。", "通过家庭365天路线图掌握重要日候选。", "AI咨询与契合诊断每天最多30次。"],
      "b2b-premium": ["AI咨询与契合诊断次数无限。", "扩大登记名额，全面深入了解人际关系。", "包含全部特权的最高方案。"],
    },
  },
  "zh-TW": {
    label: "具體優點與使用方式", showAll: "顯示全部方案", hideLower: "隱藏較低方案",
    items: {
      free: ["每天免費查看個人特質與今日運勢的4個基本項目。", "AI諮詢與契合診斷每天各可體驗1次。", "先登錄個人資料，作為了解自己的入口。"],
      standard: ["AI諮詢每天5次，契合診斷每天3次。", "新增購物指南與健康建議，助力日常選擇。", "可查看前後1個月的地球曆用於計畫。"],
      vip: ["AI諮詢每天15次，契合診斷每天10次，支援語音朗讀。", "解鎖本月3幸運、先天方位類型與今年方位、人際指南。", "高畫質藝術保存與分享，以及365天個人生物節律。"],
      b2b: ["登錄家人或團隊，疊加查看所有人的節律。", "透過家庭365天路線圖掌握重要日候選。", "AI諮詢與契合診斷每天最多30次。"],
      "b2b-premium": ["AI諮詢與契合診斷次數無限。", "擴大登錄名額，全面深入了解人際關係。", "包含全部特權的最高方案。"],
    },
  },
  ko: {
    label: "구체적인 장점과 사용법", showAll: "모든 플랜 보기", hideLower: "하위 플랜 숨기기",
    items: {
      free: ["나의 특성과 오늘의 운세 기본 4항목을 매일 무료로 열람.", "AI 상담과 궁합 진단을 하루 1회씩 체험.", "먼저 프로필을 등록해 나를 아는 첫걸음으로."],
      standard: ["AI 상담 하루 5회, 궁합 진단 하루 3회.", "쇼핑 가이드와 건강 조언이 추가되어 일상 선택에 활용.", "지구력을 전후 1개월 열람해 일정 계획에 활용."],
      vip: ["AI 상담 하루 15회, 궁합 진단 하루 10회, 음성 읽기 지원.", "이달의 3행운, 타고난 방위 타입과 올해 방위, 대인 가이드 해제.", "고화질 아트 저장·공유와 365일 개인 바이오리듬."],
      b2b: ["가족이나 팀을 등록해 모두의 리듬을 겹쳐 확인.", "패밀리 365일 로드맵으로 중요한 날 후보 파악.", "AI 상담·궁합 진단 하루 최대 30회."],
      "b2b-premium": ["AI 상담·궁합 진단 무제한.", "등록 인원을 넓혀 관계 전체를 깊이 파악.", "모든 혜택을 포함한 최상위 플랜."],
    },
  },
  es: {
    label: "Beneficios y cómo usarlo", showAll: "Ver todos los planes", hideLower: "Ocultar planes inferiores",
    items: {
      free: ["Consulta tus rasgos y cuatro elementos diarios gratis cada día.", "Prueba la sala de consulta y la compatibilidad una vez al día.", "Registra tu perfil como punto de partida."],
      standard: ["Consulta: 5 al día; compatibilidad: 3 al día.", "Añade guía de compras y consejos de salud.", "Explora el Calendario de la Tierra ±1 mes."],
      vip: ["Consulta: 15 al día; compatibilidad: 10 al día, con lectura en voz.", "Desbloquea suertes del mes, tipo de dirección natal, dirección del año y guía de relaciones.", "Guarda y comparte arte en alta resolución y biorritmo personal de 365 días."],
      b2b: ["Registra familia o equipo y superpone sus ritmos.", "Fechas candidatas en la hoja de ruta familiar de 365 días.", "Consulta y compatibilidad hasta 30 al día."],
      "b2b-premium": ["Consulta y compatibilidad ilimitadas.", "Más plazas para ver todo tu círculo en profundidad.", "El nivel superior con todos los beneficios."],
    },
  },
  fr: {
    label: "Avantages et utilisation", showAll: "Afficher toutes les formules", hideLower: "Masquer les formules inférieures",
    items: {
      free: ["Consultez vos traits et quatre éléments du jour gratuitement.", "Essayez la consultation et la compatibilité une fois par jour.", "Enregistrez votre profil pour commencer."],
      standard: ["Consultation : 5/jour ; compatibilité : 3/jour.", "Ajoute un guide d'achats et des conseils santé.", "Parcourez le calendrier terrestre à ±1 mois."],
      vip: ["Consultation : 15/jour ; compatibilité : 10/jour, avec lecture vocale.", "Débloque chances du mois, type de direction natal, direction de l'année et guide relationnel.", "Sauvegarde et partage d'art haute résolution, biorythme personnel sur 365 jours."],
      b2b: ["Enregistrez famille ou équipe et superposez leurs rythmes.", "Dates candidates sur la feuille de route familiale de 365 jours.", "Consultation et compatibilité jusqu'à 30 par jour."],
      "b2b-premium": ["Consultation et compatibilité illimitées.", "Plus de places pour voir tout votre cercle en profondeur.", "La formule suprême avec tous les avantages."],
    },
  },
};

const groupLine: Record<Language, (n: number) => string> = {
  ja: n => n ? `グループ登録は最大${n}件。家族・職場・友人などをまとめ、グループカラーと調和度、平均リズムを確認できます。` : "グループ登録はスタンダード以上で利用できます（1件〜）。",
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
    const items = Object.fromEntries((Object.keys(d.items) as Plan[]).map(plan => [plan, [...d.items[plan], groupLine[lang](groupLimit[plan])]])) as Record<Plan, string[]>;
    return [lang, { ...d, items }];
  }),
) as Record<Language, Detail>;
