import { z } from "zod";
import { computeCoreLayers } from "@/lib/ai/core-layers";
import { birthColorSpectrum } from "@/lib/birth-color-spectrum";
import { getFiveElements } from "@/lib/ai/five-elements";
import { mingGua } from "@/lib/feng-shui";
import { dayElement, lifePath, pairScore, relation } from "@/lib/team-analysis";
import type { Language } from "@/lib/translations";

const date = z.string().date().refine(v => v >= "1900-01-01" && v <= new Date().toISOString().slice(0, 10));
export const partnerSchema = z.object({
  name: z.string().trim().max(40), birthDate: date,
  birthTime: z.union([z.literal(""), z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/)]),
  birthPlace: z.string().max(20), birthCity: z.string().trim().max(80),
  bloodType: z.enum(["", "A", "B", "O", "AB"]),
  siblingOrder: z.enum(["", "first", "middle", "last", "only"]),
});
export type PartnerInput = z.infer<typeof partnerSchema>;
type Owner = { name: string; birthDate: string; birthTime: string; birthTimeUnknown: boolean; birthPlace: string; birthCity: string; bloodType: string; siblingOrder: string; nameRomaji: string; gender: string };

const words: Record<Language, { titles: [string, string, string, string]; labels: [string, string]; same: string; different: string; generation: string; control: string; neutral: string; color: string; notAvailable: string; missing: string; reference: string; phrases: [string, string]; caution: string }> = {
  ja: { titles: ["引き寄せの傾向", "思考の相乗効果", "衝突点と対処", "バースカラーの補完"], labels: ["本人", "相手"], same: "同じ五行が重なる", different: "異なる五行が向き合う", generation: "五行が生み合う組み合わせ", control: "五行が抑制し合う組み合わせ", neutral: "五行は直接の生克関係にない", color: "参考カラー", notAvailable: "未算出", missing: "姓名五格は姓と名を空白で区切り、対応漢字が揃った場合のみ計算します。出生時間・出生地・性別がない層も推測しません。", reference: "占術上の比較と独自参考モデルです。相手の気持ち・性格・未来は判定できません。", phrases: ["話す順番と結論の期限を先に決める", "得意な役割を分け、意見が違う理由を言葉で確かめる"], caution: "相手の意図を推測せず、予定と希望を直接確認する" },
  en: { titles: ["Attraction pattern", "Thinking together", "Friction & response", "Birth-color pairing"], labels: ["You", "Partner"], same: "matching elements", different: "different elements", generation: "a generating element pair", control: "a controlling element pair", neutral: "no direct generating or controlling link", color: "Reference color", notAvailable: "Not calculated", missing: "Name grids need a supported kanji surname and given name separated by a space. Missing birth time, place, or gender is never guessed.", reference: "A reflective comparison using traditional and original models, not a test of feelings, character, or future outcomes.", phrases: ["agree on speaking order and a decision deadline", "divide roles and ask why your views differ"], caution: "ask directly about plans and preferences rather than guessing intentions" },
  "zh-CN": { titles: ["吸引倾向", "思维协同", "摩擦点与应对", "出生色互补"], labels: ["本人", "对方"], same: "五行相同", different: "五行不同", generation: "五行相生", control: "五行相克", neutral: "五行无直接生克", color: "参考颜色", notAvailable: "未计算", missing: "姓名五格须以空格区分姓和名，且汉字笔画可查。缺少的出生时间、地点或性别不作推测。", reference: "传统与原创模型的参考比较，无法判断感情、性格或未来。", phrases: ["先约定发言顺序与决定期限", "分配角色并询问不同意见的原因"], caution: "直接确认计划和需求，不猜测对方意图" },
  "zh-TW": { titles: ["吸引傾向", "思維協同", "摩擦點與應對", "出生色互補"], labels: ["本人", "對方"], same: "五行相同", different: "五行不同", generation: "五行相生", control: "五行相剋", neutral: "五行無直接生剋", color: "參考顏色", notAvailable: "未算出", missing: "姓名五格須以空格區分姓與名，且漢字筆畫可查。缺少的出生時間、地點或性別不作推測。", reference: "傳統與原創模型的參考比較，無法判斷感情、性格或未來。", phrases: ["先約定發言順序與決定期限", "分配角色並詢問不同意見的原因"], caution: "直接確認計畫與需求，不猜測對方意圖" },
  ko: { titles: ["끌림의 경향", "사고의 시너지", "마찰과 대응", "탄생색의 조합"], labels: ["본인", "상대"], same: "같은 오행", different: "서로 다른 오행", generation: "상생하는 오행", control: "상극인 오행", neutral: "직접적인 상생·상극 없음", color: "참고 색상", notAvailable: "계산 불가", missing: "성명 오격에는 성과 이름을 띄어 쓴 지원 한자가 필요합니다. 출생 시간·장소·성별은 추측하지 않습니다.", reference: "전통 및 독자 모델에 따른 참고 비교이며 감정·성격·미래를 판정하지 않습니다.", phrases: ["발언 순서와 결정 기한을 정하기", "역할을 나누고 견해가 다른 이유를 묻기"], caution: "의도를 추측하지 않고 일정과 희망을 직접 확인하기" },
  es: { titles: ["Patrón de atracción", "Sinergia de ideas", "Fricción y respuesta", "Colores complementarios"], labels: ["Tú", "Otra persona"], same: "elementos iguales", different: "elementos distintos", generation: "elementos que se generan", control: "elementos que se controlan", neutral: "sin vínculo directo entre elementos", color: "Color orientativo", notAvailable: "Sin calcular", missing: "La lectura del nombre requiere apellido y nombre en kanji compatible separados por espacio. No se inventan hora, lugar o género.", reference: "Comparación orientativa tradicional y original; no determina sentimientos, carácter ni futuro.", phrases: ["acordar turnos para hablar y una fecha para decidir", "repartir funciones y preguntar por las diferencias"], caution: "preguntar directamente por planes y deseos, sin suponer intenciones" },
  fr: { titles: ["Tendance d'attirance", "Synergie de pensée", "Friction et réponse", "Couleurs complémentaires"], labels: ["Vous", "Autre personne"], same: "mêmes éléments", different: "éléments différents", generation: "éléments qui se nourrissent", control: "éléments qui se contrôlent", neutral: "pas de lien direct entre éléments", color: "Couleur indicative", notAvailable: "Non calculé", missing: "Le calcul du nom exige un nom et un prénom en kanji pris en charge, séparés par un espace. Heure, lieu et genre manquants ne sont pas devinés.", reference: "Comparaison indicative issue de modèles traditionnels et originaux, sans prédire émotions, personnalité ni avenir.", phrases: ["convenir d'un ordre de parole et d'une échéance", "répartir les rôles et demander pourquoi les avis divergent"], caution: "demander directement les attentes plutôt que prêter des intentions" },
};

export function analyzeCompatibility(owner: Owner, input: PartnerInput, language: Language) {
  const parsed = partnerSchema.safeParse(input);
  if (!parsed.success || !date.safeParse(owner.birthDate).success) return null;
  const partner = parsed.data;
  const a = computeCoreLayers({ ...owner, nameKanji: owner.name, birthTime: owner.birthTime, birthTimeUnknown: owner.birthTimeUnknown });
  const b = computeCoreLayers({ nameKanji: partner.name, nameRomaji: "", birthDate: partner.birthDate, birthTime: partner.birthTime, birthTimeUnknown: !partner.birthTime, bloodType: partner.bloodType, birthPlace: partner.birthPlace, birthCity: partner.birthCity });
  if (!a || !b) return null;
  const w = words[language];
  const pair = { birthDate: owner.birthDate, id: "owner", name: owner.name, gender: owner.gender, bloodType: owner.bloodType, role: "", skills: [] };
  const other = { birthDate: partner.birthDate, id: "partner", name: partner.name, gender: "undisclosed", bloodType: partner.bloodType, role: "", skills: [] };
  const rel = relation(pair, other);
  const score = pairScore(pair, other);
  const colorsA = birthColorSpectrum({ ...owner, birthPlace: owner.birthPlace });
  const colorsB = birthColorSpectrum({ birthDate: partner.birthDate, birthTime: partner.birthTime, birthTimeUnknown: !partner.birthTime, birthPlace: partner.birthPlace });
  const nameA = getFiveElements({ nameKanji: owner.name, birthDate: owner.birthDate, bloodType: owner.bloodType });
  const nameB = getFiveElements({ nameKanji: partner.name, birthDate: partner.birthDate, bloodType: partner.bloodType });
  const kuaA = mingGua(owner.birthDate, owner.gender);
  const evidence = [
    `${w.labels[0]}: ${a.western.sun} / ${a.shichu.dayMaster} / ${a.animal.core ?? w.notAvailable} / ${lifePath(owner.birthDate)}`,
    `${w.labels[1]}: ${b.western.sun} / ${b.shichu.dayMaster} / ${b.animal.core ?? w.notAvailable} / ${lifePath(partner.birthDate)}`,
    `${w.labels[0]} ${a.name ? `${a.name.person}・${a.name.total}` : w.notAvailable} · ${w.labels[1]} ${b.name ? `${b.name.person}・${b.name.total}` : w.notAvailable}`,
    `${nameA.eto ?? w.notAvailable} × ${nameB.eto ?? w.notAvailable} · ${w.labels[0]} ${kuaA?.branches.map(branch => branch.number).join("/") ?? w.notAvailable} / ${w.labels[1]} ${w.notAvailable}`,
    `${w.labels[1]}: ${partner.birthTime && partner.birthPlace ? `${partner.birthTime} ${partner.birthPlace} ${partner.birthCity}` : w.notAvailable} · ${partner.bloodType || w.notAvailable} · ${partner.siblingOrder || w.notAvailable}`,
  ];
  const dynamic = rel === "same" ? w.same : rel === "generate" ? w.generation : rel === "control" ? w.control : w.neutral;
  const sentences = language === "ja" ? [
    `太陽は${a.western.sun}と${b.western.sun}、本質動物は${a.animal.core ?? "未算出"}と${b.animal.core ?? "未算出"}。生年月日由来の五行は${dynamic}。これは惹かれ方の参考パターンで、好意を証明する値ではありません。`,
    `ライフパス${lifePath(owner.birthDate)}と${lifePath(partner.birthDate)}、日干は${a.shichu.dayMaster}と${b.shichu.dayMaster}。${rel === "generate" ? "発想と実行を分担する形を試せます。" : "同じ結論でも考える順序が違う前提で、役割を言葉にすると話し合いが進みます。"}`,
    `${rel === "control" ? "五行では抑制関係があるため、結論を急ぐ場面で意見の違いを拾いやすい組み合わせ。" : "生年月日から見えるペースの違いを、性格の断定として扱わないことが大切です。"}${w.phrases[rel === "control" ? 0 : 1]}。${w.caution}。`,
    `${w.labels[0]} ${colorsA?.main.name ?? w.notAvailable} ${colorsA?.main.code ?? ""} × ${w.labels[1]} ${colorsB?.main.name ?? w.notAvailable} ${colorsB?.main.code ?? ""}。1440色の独自参考パレットを並べた組み合わせであり、科学的な相性測定ではありません。`,
  ] : [
    `${w.labels[0]} ${a.western.sun} / ${a.animal.core ?? w.notAvailable}; ${w.labels[1]} ${b.western.sun} / ${b.animal.core ?? w.notAvailable}. ${dynamic}; this is a reflective pattern, not proof of attraction.`,
    `${w.labels[0]} ${lifePath(owner.birthDate)} / ${a.shichu.dayMaster}; ${w.labels[1]} ${lifePath(partner.birthDate)} / ${b.shichu.dayMaster}. ${w.phrases[1]}.`,
    `${dynamic}. ${w.phrases[0]}; ${w.caution}.`,
    `${w.labels[0]} ${colorsA?.main.name ?? w.notAvailable} ${colorsA?.main.code ?? ""} × ${w.labels[1]} ${colorsB?.main.name ?? w.notAvailable} ${colorsB?.main.code ?? ""}. ${w.color}: an illustrative palette, not a measured compatibility scale.`,
  ];
  return { score, titles: w.titles, sentences, evidence, colors: [colorsA?.main.code, colorsB?.main.code], note: `${w.missing} ${w.reference}`, dynamic, elementPair: `${dayElement(owner.birthDate)} × ${dayElement(partner.birthDate)}` };
}
