import { Sparkles } from "lucide-react";
import type { UserProfile } from "./Onboarding";
import type { Language } from "@/lib/translations";
import { translations } from "@/lib/translations";

const signs = [
  "山羊座", "水瓶座", "魚座", "牡羊座", "牡牛座", "双子座", "蟹座", "獅子座", "乙女座", "天秤座", "蠍座", "射手座", "山羊座",
];
const signEnglish = [
  "Capricorn", "Aquarius", "Pisces", "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo", "Libra", "Scorpio", "Sagittarius", "Capricorn",
];
const boundaries = [0, 20, 19, 21, 20, 21, 22, 23, 23, 23, 24, 23, 22];
const animals = ["子（ねずみ）", "丑（うし）", "寅（とら）", "卯（うさぎ）", "辰（たつ）", "巳（へび）", "午（うま）", "未（ひつじ）", "申（さる）", "酉（とり）", "戌（いぬ）", "亥（いのしし）"];
const animalsEnglish = ["Rat", "Ox", "Tiger", "Rabbit", "Dragon", "Snake", "Horse", "Goat", "Monkey", "Rooster", "Dog", "Pig"];

const copy: Record<Language, {
  title: string; note: string; sign: string; animal: string; number: string; blood: string; sibling: string;
  strength: string; style: string; tip: string; strengths: string[]; styles: string[]; tips: string[];
}> = {
  ja: { title: "あなたの人物像", note: "入力情報をもとにした参考用の人物像です。性格や能力の判定、多層統合占術による正式な鑑定ではありません。星座は太陽星座の目安、干支は暦年基準です。", sign: "星座", animal: "干支", number: "生年月日数", blood: "血液型", sibling: "続柄", strength: "活かせる視点", style: "向き合い方", tip: "次の一歩", strengths: ["物事の全体像を見渡す", "ひとつずつ丁寧に進める", "新しい可能性を探す", "人との対話を大切にする"], styles: ["まず目的を言葉にしてから動く", "小さく試して手応えを確かめる", "複数の選択肢を並べて考える", "相手の意見を聞きながら形にする"], tips: ["今週取り組むことを一つ決めてみましょう。", "大きな決断の前に、必要な情報を一つ確認しましょう。", "自分にとって大切な条件を三つ書き出してみましょう。", "信頼できる人に考えを話してみましょう。"] },
  en: { title: "Your portrait", note: "An illustrative portrait based on your inputs, not a judgment of personality or ability or a verified multi-layer reading. Sun sign is approximate; zodiac animal uses the calendar year.", sign: "Sun sign", animal: "Year animal", number: "Birth-date number", blood: "Blood type", sibling: "Sibling order", strength: "A perspective to try", style: "How to approach", tip: "Next step", strengths: ["See the bigger picture", "Work carefully, step by step", "Explore new possibilities", "Value dialogue with others"], styles: ["Name your goal before acting", "Try a small experiment first", "Compare several options", "Listen to others as you shape a plan"], tips: ["Choose one thing to focus on this week.", "Check one key fact before a big decision.", "Write down your three priorities.", "Talk through your thoughts with someone you trust."] },
  "zh-CN": { title: "你的人物画像", note: "根据输入信息生成的参考画像，并非性格、能力评判或多层统合占术正式鉴定。星座为太阳星座的近似值，生肖按公历年份计算。", sign: "星座", animal: "生肖", number: "生日数字", blood: "血型", sibling: "排行", strength: "可以尝试的视角", style: "行动方式", tip: "下一步", strengths: ["把握全局", "循序渐进", "探索新可能", "重视对话"], styles: ["先明确目标再行动", "先小范围尝试", "比较多种选择", "倾听他人意见"], tips: ["确定本周的一项重点。", "重大决定前核实一条关键信息。", "写下三个重要条件。", "和信任的人谈谈你的想法。"] },
  "zh-TW": { title: "你的人物畫像", note: "根據輸入資訊產生的參考畫像，並非性格、能力評斷或多層統合占術正式鑑定。星座為太陽星座的近似值，生肖按西元年份計算。", sign: "星座", animal: "生肖", number: "生日數字", blood: "血型", sibling: "排行", strength: "可以嘗試的視角", style: "行動方式", tip: "下一步", strengths: ["掌握全局", "循序漸進", "探索新可能", "重視對話"], styles: ["先明確目標再行動", "先小範圍嘗試", "比較多種選擇", "傾聽他人意見"], tips: ["確定本週的一項重點。", "重大決定前核實一項關鍵資訊。", "寫下三個重要條件。", "和信任的人聊聊你的想法。"] },
  ko: { title: "나의 인물상", note: "입력 정보를 바탕으로 한 참고용 이미지입니다. 성격·능력 평가나 다층 통합 점술의 정식 분석이 아닙니다. 별자리는 태양궁 근삿값, 띠는 양력 연도 기준입니다.", sign: "별자리", animal: "띠", number: "생일 숫자", blood: "혈액형", sibling: "형제 순서", strength: "시도할 관점", style: "접근 방식", tip: "다음 단계", strengths: ["전체 그림 보기", "차근차근 진행하기", "새로운 가능성 찾기", "대화 중시하기"], styles: ["목표를 먼저 말로 정리하기", "작게 시도해 보기", "여러 선택지 비교하기", "상대의 의견 듣기"], tips: ["이번 주 집중할 일 한 가지를 정해 보세요.", "큰 결정 전 핵심 사실 하나를 확인하세요.", "중요한 조건 세 가지를 적어 보세요.", "믿을 만한 사람과 생각을 나눠 보세요."] },
  es: { title: "Tu retrato", note: "Retrato ilustrativo basado en tus datos; no evalúa tu personalidad o capacidad ni es una lectura verificada de artes multicapa. Signo solar aproximado; animal según el año civil.", sign: "Signo solar", animal: "Animal del año", number: "Número de nacimiento", blood: "Grupo sanguíneo", sibling: "Orden familiar", strength: "Perspectiva a probar", style: "Cómo abordarlo", tip: "Siguiente paso", strengths: ["Ver el panorama completo", "Avanzar paso a paso", "Explorar posibilidades", "Valorar el diálogo"], styles: ["Definir el objetivo primero", "Probar a pequeña escala", "Comparar opciones", "Escuchar a los demás"], tips: ["Elige una prioridad para esta semana.", "Confirma un dato clave antes de decidir.", "Anota tus tres prioridades.", "Habla de tus ideas con alguien de confianza."] },
  fr: { title: "Votre portrait", note: "Portrait illustratif basé sur vos données, sans jugement de personnalité ou d'aptitudes ni analyse vérifiée des multi-layer arts. Signe solaire approximatif ; animal selon l'année civile.", sign: "Signe solaire", animal: "Animal de l'année", number: "Nombre de naissance", blood: "Groupe sanguin", sibling: "Rang familial", strength: "Une piste à explorer", style: "Une façon d'agir", tip: "Prochaine étape", strengths: ["Voir l'ensemble", "Avancer étape par étape", "Explorer des possibilités", "Privilégier le dialogue"], styles: ["Nommer l'objectif d'abord", "Tester à petite échelle", "Comparer les options", "Écouter les autres"], tips: ["Choisissez une priorité pour la semaine.", "Vérifiez un fait clé avant de décider.", "Notez trois priorités.", "Parlez de vos idées à une personne de confiance."] },
};

export default function PersonPortrait({ profile, language }: { profile: UserProfile; language: Language }) {
  const t = copy[language];
  const base = translations[language];
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(profile.birthDate);
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (month < 1 || month > 12 || day < 1 || day > 31) return null;
  const index = month - (day < (boundaries[month] ?? 1) ? 1 : 0);
  const dateNumber = Array.from(profile.birthDate.replaceAll("-", "")).reduce((sum, digit) => sum + Number(digit), 0);
  const lifePath = dateNumber > 0 ? (dateNumber - 1) % 9 + 1 : 0;
  const seed = year + month * 31 + day + (profile.bloodType.charCodeAt(0) || 0) + ["first", "middle", "last", "only"].indexOf(profile.siblingOrder);
  const siblingIndex = ["first", "middle", "last", "only"].indexOf(profile.siblingOrder);
  const chips = [
    [base.birthDate, profile.birthDate],
    [t.sign, ["ja", "zh-CN", "zh-TW"].includes(language) ? signs[index] : signEnglish[index]],
    [t.animal, ["ja", "zh-CN", "zh-TW"].includes(language) ? animals[((year - 4) % 12 + 12) % 12] : animalsEnglish[((year - 4) % 12 + 12) % 12]],
    [t.number, String(lifePath)],
    [t.blood, profile.bloodType || "—"],
    [t.sibling, siblingIndex >= 0 ? base.siblings[siblingIndex] : "—"],
  ];
  return (
    <section className="rounded-lg border border-primary/35 bg-card/65 p-5 shadow-champagne backdrop-blur-md sm:p-7" aria-label={t.title}>
      <div className="flex items-center gap-2 text-primary"><Sparkles className="size-5 shrink-0" aria-hidden="true" /><h2 className="font-serif text-xl text-gradient-gold">{t.title}</h2></div>
      <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
        {chips.map(([label, value]) => <div key={label} className="min-w-0 rounded-md border border-primary/15 bg-background/45 px-3 py-2"><p className="text-[11px] text-muted-foreground">{label}</p><p className="mt-1 break-words text-sm font-medium text-foreground">{value}</p></div>)}
      </div>
      <div className="mt-5 grid gap-4 border-t border-primary/20 pt-4 sm:grid-cols-3">
        {[[t.strength, t.strengths[seed % 4]], [t.style, t.styles[(seed + 1) % 4]], [t.tip, t.tips[(seed + 2) % 4]]].map(([label, value]) => <div key={label}><p className="text-xs font-semibold text-primary">{label}</p><p className="mt-1 text-sm leading-6 text-foreground/85">{value}</p></div>)}
      </div>
      <p className="mt-4 border-t border-primary/10 pt-3 text-xs leading-5 text-muted-foreground">{t.note}</p>
    </section>
  );
}
