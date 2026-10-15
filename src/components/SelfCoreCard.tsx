import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { ArrowUpRight, Building2, Check, Compass, Crown, Dna, Fingerprint, Gem, Heart, Orbit, Sparkles, Sprout } from "lucide-react";
import { useMemo, useState, type ReactNode } from "react";
import ShareCardButton from "./ShareCardButton";
import GrandSummaryCard from "./GrandSummaryCard";
import { AgolmenLoading } from "./AgolmenSpiral";
import { usePlan } from "./PlanProvider";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { generateHomeReading } from "@/lib/ai/home-reading.functions";
import { fiveElementsCopy } from "@/lib/five-elements-copy";
import { homeReadingCopy, readingCompleteMessage } from "@/lib/home-reading-copy";
import { computeCoreLayers, type CoreLayers } from "@/lib/ai/core-layers";
import { homePlanCardsCopy, type HomePlanId } from "@/lib/home-plan-cards";
import { torisetsuTranslations, type Language } from "@/lib/translations";
import type { UserProfile } from "./Onboarding";
import { splittableName } from "@/lib/ai/five-elements";
import { isUpgradePlan } from "@/lib/plans";
import type { Plan } from "@/lib/design-modes";
import { birthColorSpectrum } from "@/lib/birth-color-spectrum";
import { fengDirectionNames, mingGua } from "@/lib/feng-shui";
import BirthColorGuide from "./BirthColorGuide";
import { SacredDisclosure } from "./ui/sacred-disclosure";
import { essenceKeys, traitReadingCopy } from "@/lib/trait-reading";

const layerCopy: Record<Language, { title: string; choose: string; names: string[]; summaries: string[]; surface: string; inner: string; moreTime: string; birthplace: string; regional: string; prefectural: string; source: string }> = {
  ja: { title: "6大占術レイヤー", choose: "占術レイヤーを選択", names: ["本格姓名判断", "精密数秘術", "西洋占星術", "四柱推命", "動物占い・独自4層参考", "本格風水学"], summaries: ["名前の五運と社会面を確認します。", "生年月日とローマ字名の数を確認します。", "出生時の天体配置を確認します。", "生年月日時の暦と要素の配分を確認します。", "生年月日の60日周期を確認します。", "生年と性別区分から方位タイプを確認します。"], surface: "表の顔", inner: "本音・潜在", moreTime: "※出生時間を設定するとさらに精密度が向上します", birthplace: "出生地", regional: "市区町村", prefectural: "都道府県", source: "代表座標をアセンダントに使用。位置データ" },
  en: { title: "Six reading layers", choose: "Choose a reading layer", names: ["Name analysis", "Numerology", "Western astrology", "Four Pillars", "Animal cycle reference", "Feng shui"], summaries: ["Reviews the five name grids and social expression.", "Reviews the key numbers from your birth date and romanized name.", "Reviews the celestial pattern at birth.", "Reviews calendar pillars and elemental balance at birth.", "Reviews an illustrative 60-day animal cycle.", "Reviews your traditional direction type from solar year and gender category."], surface: "Outer expression", inner: "Inner tendencies", moreTime: "Add a birth time for a more precise calculation.", birthplace: "Birthplace", regional: "municipal", prefectural: "prefectural", source: "representative coordinates used for the ascendant. Location data" },
  "zh-CN": { title: "六大解读视角", choose: "选择解读视角", names: ["姓名分析", "数秘术", "西方占星", "四柱", "动物周期参考", "风水"], summaries: ["查看姓名五格与社会表现。", "查看生日与罗马字姓名中的关键数字。", "查看出生时的天体配置。", "查看出生历法四柱与元素平衡。", "查看参考性的60日动物周期。", "根据太阳年与性别类别查看传统方位类型。"], surface: "外在表现", inner: "内在倾向", moreTime: "填写出生时间可提高计算精度。", birthplace: "出生地", regional: "市区", prefectural: "省级", source: "代表坐标用于计算上升点。位置数据" },
  "zh-TW": { title: "六大解讀視角", choose: "選擇解讀視角", names: ["姓名分析", "數秘術", "西方占星", "四柱", "動物週期參考", "風水"], summaries: ["查看姓名五格與社會表現。", "查看生日與羅馬字姓名中的關鍵數字。", "查看出生時的天體配置。", "查看出生曆法四柱與元素平衡。", "查看參考性的60日動物週期。", "依太陽年與性別類別查看傳統方位類型。"], surface: "外在表現", inner: "內在傾向", moreTime: "填寫出生時間可提高計算精度。", birthplace: "出生地", regional: "市區", prefectural: "縣市", source: "代表座標用於計算上升點。位置資料" },
  ko: { title: "여섯 가지 해석 관점", choose: "해석 관점 선택", names: ["이름 분석", "수비학", "서양 점성술", "사주", "동물 주기 참고", "풍수"], summaries: ["이름의 다섯 격과 사회적 표현을 살펴봅니다.", "생일과 로마자 이름의 핵심 숫자를 살펴봅니다.", "출생 당시의 천체 배치를 살펴봅니다.", "출생 시점의 달력 기둥과 오행 균형을 살펴봅니다.", "참고용 60일 동물 주기를 살펴봅니다.", "태양년과 성별 구분으로 전통 방위 유형을 살펴봅니다."], surface: "겉으로 드러나는 모습", inner: "내면의 경향", moreTime: "출생 시간을 입력하면 계산이 더 정밀해집니다.", birthplace: "출생지", regional: "시군구", prefectural: "광역", source: "대표 좌표를 상승점 계산에 사용. 위치 데이터" },
  es: { title: "Seis perspectivas", choose: "Elige una perspectiva", names: ["Análisis del nombre", "Numerología", "Astrología occidental", "Cuatro Pilares", "Ciclo animal orientativo", "Feng shui"], summaries: ["Revisa los cinco cuadros del nombre y la expresión social.", "Revisa los números clave de la fecha y el nombre romanizado.", "Revisa la configuración celeste al nacer.", "Revisa los pilares del calendario y el equilibrio elemental.", "Revisa un ciclo animal ilustrativo de 60 días.", "Revisa el tipo de dirección tradicional según año solar y categoría de género."], surface: "Expresión exterior", inner: "Tendencias internas", moreTime: "Añade la hora de nacimiento para afinar el cálculo.", birthplace: "Lugar de nacimiento", regional: "municipal", prefectural: "regional", source: "coordenadas representativas usadas para el ascendente. Datos" },
  fr: { title: "Six perspectives", choose: "Choisir une perspective", names: ["Analyse du nom", "Numérologie", "Astrologie occidentale", "Quatre Piliers", "Cycle animal indicatif", "Feng shui"], summaries: ["Examine les cinq cadres du nom et l’expression sociale.", "Examine les nombres clés de la date et du nom romanisé.", "Examine la configuration céleste à la naissance.", "Examine les piliers calendaires et l’équilibre des éléments.", "Examine un cycle animal indicatif de 60 jours.", "Examine le type de direction traditionnel selon l’année solaire et la catégorie de genre."], surface: "Expression extérieure", inner: "Tendances intérieures", moreTime: "Ajoutez l’heure de naissance pour affiner le calcul.", birthplace: "Lieu de naissance", regional: "municipal", prefectural: "régional", source: "coordonnées représentatives utilisées pour l’ascendant. Données" },
};

const nameCopy: Record<Language, { title: string; grids: [string, string, string, string, string]; fortune: string; split: string; save: string; note: string }> = {
  ja: { title: "本格 姓名判断（五運と人生の軸）", grids: ["天格（家系運）", "人格（主運・内面）", "地格（基礎運）", "外格（対人・環境運）", "総格（総合・晩年運）"], fortune: "名前が示す社会的な強みと引き寄せる運命", split: "姓と名の区切りを選ぶと五運を算出して保存します", save: "この区切りで保存", note: "現代字体の画数・霊数を外格のみに加える方式・一般的な81数の吉凶表に基づく参考値です。流派により異なります。" },
  en: { title: "Name reading (five grids)", grids: ["Heaven (family)", "Person (core)", "Earth (foundation)", "Outer (social)", "Total (overall)"], fortune: "Social strengths your name suggests", split: "Choose where your surname ends to calculate and save the five grids", save: "Save this split", note: "Reference values using modern stroke counts and a common 81-number table; schools differ." },
  "zh-CN": { title: "姓名五格", grids: ["天格", "人格", "地格", "外格", "总格"], fortune: "姓名显示的社会优势", split: "选择姓与名的分界以计算并保存五格", save: "按此保存", note: "基于现代笔画与常见81数吉凶表的参考值，流派不同结果可能不同。" },
  "zh-TW": { title: "姓名五格", grids: ["天格", "人格", "地格", "外格", "總格"], fortune: "姓名顯示的社會優勢", split: "選擇姓與名的分界以計算並儲存五格", save: "依此儲存", note: "基於現代筆畫與常見81數吉凶表的參考值，流派不同結果可能不同。" },
  ko: { title: "성명 오격", grids: ["천격", "인격", "지격", "외격", "총격"], fortune: "이름이 보여주는 사회적 강점", split: "성과 이름의 경계를 선택하면 오격을 계산해 저장합니다", save: "이대로 저장", note: "현대 획수와 일반적인 81수 길흉표에 따른 참고값이며 유파마다 다릅니다." },
  es: { title: "Lectura del nombre (cinco cuadros)", grids: ["Cielo", "Persona", "Tierra", "Exterior", "Total"], fortune: "Fortalezas sociales que sugiere tu nombre", split: "Elige dónde termina tu apellido para calcular y guardar", save: "Guardar", note: "Valores de referencia con trazos modernos y una tabla común de 81 números." },
  fr: { title: "Lecture du nom (cinq cadres)", grids: ["Ciel", "Personne", "Terre", "Extérieur", "Total"], fortune: "Forces sociales suggérées par votre nom", split: "Choisissez la fin du nom de famille pour calculer et enregistrer", save: "Enregistrer", note: "Valeurs de référence avec traits modernes et une table courante de 81 nombres." },
};

type LayerReading = Awaited<ReturnType<typeof generateHomeReading>>;
function CoreLayersPanel({ layers: c, profile, language, reading, loading, nameDetails }: { layers: CoreLayers; profile: UserProfile; language: Language; reading: LayerReading | undefined; loading: boolean; nameDetails: ReactNode }) {
  const [selected, setSelected] = useState(0);
  const [open, setOpen] = useState(false);
  const copy = homeReadingCopy[language];
  const passages = reading ? [
    [reading.nameNature, reading.nameGuide], [reading.numerologyNature, reading.numerologyGuide],
    [reading.westernNature, reading.westernGuide], [reading.pillarsNature, reading.pillarsGuide],
    [reading.animalNature, reading.animalGuide], [reading.fengNature, reading.fengGuide],
  ] : [];
  const passage = passages[selected];
  const gua = mingGua(profile.birthDate, profile.gender)?.branches[0] ?? null;
  const N = fengDirectionNames;
  const lp = c.numerology.lifePath;
  const lc = layerCopy[language];
  const localizedRows: [string, string][] = lc.names.map((name, index) => [name ?? "", lc.summaries[index] ?? ""]);
  const rows: [string, string][] = language === "ja" ? [
    ["本格姓名判断", c.name ? `人格${c.name.person}（${c.name.luck.person}）・総格${c.name.total}（${c.name.luck.total}）` : "姓と名を区切ると五運を計算します"],
    ["精密数秘術", `ライフパス${lp}・ソウル${c.numerology.soul ?? "—"}・ディスティニー${c.numerology.destiny ?? "—"}`],
    ["西洋占星術", `太陽${c.western.sun}・月${c.western.moon}${c.western.ascendant ? `・ASC${c.western.ascendant}` : ""}`],
    ["四柱推命", `日干${c.shichu.dayMaster}・五行最多${c.shichu.dominant}・月柱${c.shichu.pillars[1]?.tsuhen}`],
    ["動物占い・独自4層参考", `本質：${c.animal.core ?? "生年月日を確認"}${c.animal.group ? `（${c.animal.group}）` : ""}`],
    ["本格風水学", gua ? `本命卦${gua.number}・${gua.group}・生気${N[gua.shengQi]}` : "性別（男性/女性）を登録すると本命卦を計算します"],
  ] : localizedRows;
  const details = language === "ja" ? [
    c.name ? `天格${c.name.sky}（${c.name.luck.sky}）、人格${c.name.person}（${c.name.luck.person}）、地格${c.name.earth}（${c.name.luck.earth}）、外格${c.name.outer}（${c.name.luck.outer}）、総格${c.name.total}（${c.name.luck.total}）。現代字体画数と一般的な81数表による参考値です。` : "姓と名を空白で区切ると五格を計算します。対応していない字の画数は推測しません。",
    `ライフパス${lp}・パーソナリティ${c.numerology.personality ?? "—"}・ソウル${c.numerology.soul ?? "—"}・ディスティニー${c.numerology.destiny ?? "—"}。現在は${c.numerology.cyclePhase}、個人年${c.numerology.personalYear}。ローマ字氏名がない場合、氏名由来の数は算出しません。`,
    `太陽${c.western.sun}・月${c.western.moon}${c.western.moonUncertain ? "（時刻不明で星座境界のため参考）" : ""}。${c.western.planets.map(p => `${p.name}${p.sign}`).join("・")}。ASC ${c.western.ascendant ?? "出生時刻と国内出生地が必要"}。天体位置は天文計算、解釈は占星術上の参考です。`,
    `${c.shichu.pillars.map(p => `${p.label}${p.kanshi}（${p.tsuhen}・${p.stage}）`).join(" / ")}。日干${c.shichu.dayMaster}、五行は${Object.entries(c.shichu.balance).map(([k, v]) => `${k}${v}`).join("・")}。${c.hasTime ? "" : "時柱には出生時刻が必要です。"}節入り境界では暦法によって異なります。`,
    `本質：${c.animal.core ?? "生年月日を確認"}。表面：${c.animal.referenceAnimals?.surface ?? "—"}、希望：${c.animal.referenceAnimals?.hope ?? "—"}、隠れ：${c.animal.referenceAnimals?.hidden ?? "—"}。後の3層は本質の60日周期をそれぞれ1・2・3日ずらした独自参考モデルで、公式4層分類や性格判定ではありません。`,
    gua ? `立春で区切る生年・${gua.group}の本命卦${gua.number}。生気${N[gua.shengQi]}・天医${N[gua.tianYi]}・延年${N[gua.yanNian]}・伏位${N[gua.fuWei]}。建物の向き・竣工期を使う個別の住居鑑定ではありません。` : "生年月日と男性式・女性式の選択があると立春基準の本命卦を表示します。性別未指定の式は推測しません。",
  ] : lc.summaries;
  return (
    <section aria-label={lc.title} className="border-b border-primary/20 py-6">
      <div aria-label={lc.choose} className="grid min-w-0 grid-cols-2 gap-3 sm:grid-cols-3">
        {rows.map(([label], i) => <Button key={label} type="button" aria-haspopup="dialog" variant="outline" onClick={() => { setSelected(i); setOpen(true); }} className="h-auto min-h-28 min-w-0 flex-col items-start justify-start whitespace-normal border-primary/30 bg-background/35 p-4 text-left [overflow-wrap:anywhere]">
          <span className="flex w-full items-center justify-between text-primary"><span className="font-mono text-xs">0{i + 1}</span><ArrowUpRight aria-hidden="true" /></span>
          <span className="font-serif text-sm text-primary">{lc.names[i]}</span>
          <span className="text-xs leading-6 text-muted-foreground">{lc.summaries[i]}</span>
        </Button>)}
      </div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="z-[200] flex max-h-[88dvh] w-[calc(100%-1.5rem)] max-w-2xl min-w-0 flex-col gap-0 overflow-hidden rounded-lg border-primary/40 bg-card p-0 [overflow-wrap:anywhere]">
          <header className="shrink-0 border-b border-primary/20 p-5 pr-12 sm:p-6 sm:pr-12">
            <DialogTitle className="font-serif text-xl leading-7 text-primary">{lc.names[selected]}</DialogTitle>
            <DialogDescription className="mt-2 text-sm leading-6">{lc.summaries[selected]}</DialogDescription>
          </header>
          <div className="min-h-0 min-w-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-contain p-5 sm:p-6">
            {passage ? <div className="space-y-6">
              <section><h4 className="font-serif text-lg text-primary">{copy.gift}</h4><p className="mt-3 whitespace-pre-line text-base leading-8 text-foreground">{passage[0]}</p></section>
              <section className="border-l-2 border-primary pl-4"><h4 className="text-sm text-primary">{copy.guide}</h4><p className="mt-2 whitespace-pre-line text-base leading-8 text-foreground">{passage[1]}</p></section>
            </div> : loading ? <AgolmenLoading compact label={copy.loading} /> : <p role="status" className="text-sm leading-7 text-muted-foreground">{copy.error}</p>}
            {selected === 0 && nameDetails}
            <SacredDisclosure className="mt-6" title={copy.basis}><p className="mt-3 text-sm leading-7 text-foreground">{rows[selected]?.[1]}</p><p className="mt-2 text-xs leading-6 text-muted-foreground">{details[selected]}</p></SacredDisclosure>
            <p className="mt-6 border-t border-primary/20 pt-4 text-xs leading-6 text-muted-foreground">{copy.preview}</p>
          </div>
        </DialogContent>
      </Dialog>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div className="rounded-md border border-primary/30 p-3"><p className="text-xs text-primary">{lc.surface}</p><p className="mt-1 text-sm text-foreground">{language === "ja" ? c.surface.join(" / ") : lc.summaries[0]}</p></div>
        <div className="rounded-md border border-primary/30 bg-primary/10 p-3"><p className="text-xs text-primary">{lc.inner}</p><p className="mt-1 text-sm text-foreground">{language === "ja" ? c.inner.join(" / ") : lc.summaries[1]}</p></div>
      </div>
      {language === "ja" && <ul className="mt-3 space-y-1 text-xs leading-6 text-muted-foreground">{c.cross.map(x => <li key={x.pair}>{x.pair}：{x.a} × {x.b} → <span className="text-primary">{x.verdict}</span></li>)}</ul>}
       {!c.hasTime && <p className="mt-3 inline-block border border-primary/30 px-3 py-2 text-sm text-primary">{lc.moreTime}</p>}
       {c.birthplace && <p className="mt-3 text-xs leading-6 text-muted-foreground">{lc.birthplace}: {language === "ja" ? c.birthplace.label : profile.birthPlace} · {c.birthplace.precision === "municipality" ? lc.regional : lc.prefectural} {lc.source}: <a className="underline" href="https://github.com/geolonia/japanese-addresses" target="_blank" rel="noopener noreferrer">Geolonia</a> (CC BY 4.0).</p>}
    </section>
  );
}

const planIcons: Record<HomePlanId, typeof Sprout> = { standard: Sprout, vip: Gem, b2b: Building2, "b2b-premium": Crown };

export default function SelfCoreCard({ profile, language, onDiagnosis, onProfileChange, currentPlan, onSelectPlan, experienceOnly = false }: { onProfileChange?: (p: UserProfile) => Promise<void>; profile: UserProfile; language: Language; onDiagnosis: () => void; currentPlan?: Plan; onSelectPlan?: (plan: HomePlanId) => void; experienceOnly?: boolean }) {
  const { override, enabled } = usePlan();
  const activePlan = enabled && override ? override : currentPlan ?? "free";
  const palette = birthColorSpectrum(profile);
  const t = homeReadingCopy[language];
  const traits = traitReadingCopy[language];
  const p = homePlanCardsCopy[language];
  const upgradeCards = p.cards.filter(card => isUpgradePlan(activePlan, card.id));
  const [dialogPlan, setDialogPlan] = useState<HomePlanId | null>(null);
  const f = fiveElementsCopy[language];
  const generate = useServerFn(generateHomeReading);
  const n = nameCopy[language];
  const chars = splittableName(profile.nameKanji);
  const localLayers = useMemo(() => computeCoreLayers(profile), [profile]);
  const gua = mingGua(profile.birthDate, profile.gender);
  const [cut, setCut] = useState(chars && chars.length >= 3 ? 2 : 1);
  const [saving, setSaving] = useState(false);
  const { data, isPending, isError, refetch } = useQuery({
    queryKey: ["home-reading-six-v15", profile, language],
    queryFn: () => generate({ data: { profile, language } }),
    staleTime: Infinity,
    retry: false,
  });
  const e = data?.elements;
  const values = e ? [e.name ? `${e.name.sky} · ${e.name.person} · ${e.name.earth} · ${e.name.outer} · ${e.name.total}` : null, e.zodiac, e.eto, e.blood, e.animal] : [];
  const sections = data ? [data.synthesis, data.name, data.mind, data.instinct, data.strength] : [];
  const coreSections = language === "ja" ? ["コアアイデンティティ", "思考バイアス", "前進と静観の内的な差"] : ["Core identity", "Decision patterns", "Advance and pause tendencies"];
  const icons = [Dna, Fingerprint, Orbit, Heart, Sparkles];

  const nameDetails = (
<section aria-label={n.title} className="my-6 border-y border-primary/25 py-5">
            <h3 className="font-serif text-lg text-gradient-gold sm:text-xl">{n.title}</h3>
            {localLayers?.name ? <>
              <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
                {(["sky", "person", "earth", "outer", "total"] as const).map((k, i) => { const l = localLayers.name?.luck[k]; return <div key={k} className="rounded-md border border-primary/25 bg-background/40 p-3 text-center">
                  <p className="text-[11px] leading-4 text-muted-foreground">{n.grids[i]}</p>
                  <p className="mt-1 font-serif text-2xl text-primary">{localLayers.name?.[k]}<span className="text-xs">画</span></p>
                  <span className={`mt-1 inline-block rounded-full px-2 py-0.5 text-[11px] ${l === "吉" ? "bg-primary text-primary-foreground" : l === "半吉" ? "border border-primary/50 text-primary" : "border border-muted-foreground/40 text-muted-foreground"}`}>{l}</span>
                </div>; })}
              </div>
              {data?.nameFortune && <><h4 className="mt-5 font-serif text-sm text-primary">{n.fortune}</h4><p className="mt-2 whitespace-pre-line text-sm leading-8 text-foreground sm:text-base">{data?.nameFortune}</p></>}
              <p className="mt-3 text-[11px] leading-5 text-muted-foreground">{n.note}</p>
            </> : chars && onProfileChange ? <div className="mt-3">
              <p className="text-sm text-muted-foreground">{n.split}</p>
              <div className="mt-3 flex flex-wrap gap-2">{chars.slice(0, -1).map((_, i) => <Button key={i} size="sm" variant={cut === i + 1 ? "default" : "outline"} onClick={() => setCut(i + 1)}>{chars.slice(0, i + 1).join("")}　{chars.slice(i + 1).join("")}</Button>)}</div>
              <Button className="mt-3" disabled={saving} onClick={async () => { setSaving(true); try { await onProfileChange({ ...profile, nameKanji: `${chars.slice(0, cut).join("")} ${chars.slice(cut).join("")}` }); } finally { setSaving(false); } }}>{n.save}</Button>
            </div> : <p className="mt-3 text-sm text-muted-foreground">{f.nameNote}</p>}
          </section>
  );

  return (
    <section aria-label={t.title} className="min-w-0 overflow-hidden rounded-lg border border-primary/35 bg-card/75 shadow-champagne backdrop-blur-md">
      <header className="flex items-start gap-3 border-b border-primary/20 bg-primary/5 p-5 sm:p-8">
        <div className="flex size-11 shrink-0 items-center justify-center rounded-full border border-primary/35 bg-primary/10 text-primary"><Compass className="size-5" aria-hidden="true" /></div>
        <div className="min-w-0"><p className="text-[10px] uppercase text-primary/75">AGOLMEN'S COMPASS · {t.openToAll}</p><h2 className="mt-2 break-words font-serif text-xl leading-snug text-gradient-gold sm:text-2xl">{t.title}</h2></div>
      </header>
      <div className="px-5 sm:px-8">
        {data?.catchphrase && !holding && <section aria-label={traits.catchphrase} className="my-6 rounded-md border-2 border-primary/60 px-4 py-6 sm:px-6 sm:py-8 [overflow-wrap:anywhere]">
          <p className="flex items-center gap-2 text-sm text-primary"><Sparkles className="size-4" aria-hidden="true" />{traits.catchphrase}</p>
          <p className="mt-4 border-l-2 border-primary pl-4 font-serif text-2xl leading-relaxed text-gradient-gold sm:pl-6 sm:text-3xl">{data.catchphrase}</p>
        </section>}
        {!experienceOnly && localLayers && <section aria-label="診断の根拠サマリー" className="border-b border-primary/20 py-4"><dl className="flex flex-wrap gap-x-5 gap-y-3">{[
          ["名前の中心数", localLayers.name ? `${localLayers.name.person}画` : "姓・名の区切りを設定"],
          ["生年月日の基本数", String(localLayers.numerology.lifePath)],
          ["生まれ日の性質", localLayers.shichu.dayMaster], ["外向き / 内面", `${localLayers.western.sun} / ${localLayers.western.moon}`],
          ["生まれ持った方位タイプ", gua?.branches[0] ? String(gua.branches[0].number) : "性別を設定"],
        ].map(([label, value]) => <div key={label} className="min-w-0"><dt className="text-xs text-muted-foreground">{label}</dt><dd className="mt-1 text-sm font-semibold text-primary">{value}</dd></div>)}</dl></section>}
        <section aria-label="自分を知る・今日のダイジェスト" className="py-6">
          <h3 className="font-serif text-xl text-primary">{traits.essence}</h3>
          {isPending || holding ? <AgolmenLoading compact label={holding ? readingCompleteMessage[language] : t.loading} /> : data ? <div className="mt-4 divide-y divide-primary/20">
            {essenceKeys.map((key, i) => <article key={key} className="min-w-0 py-5 [overflow-wrap:anywhere]">
              <h4 className="flex items-start gap-3 font-serif text-lg leading-8 text-primary"><span className="shrink-0 font-mono text-xs leading-8">0{i + 1}</span><span>{traits.headings[i]}</span></h4>
              <p className="mt-3 whitespace-pre-line text-base leading-8 text-foreground">{data.essence[key]}</p>
            </article>)}
          </div> : <p role="status" className="mt-3 text-foreground">{t.error}</p>}
          {isError && <Button variant="outline" className="mt-3" onClick={() => void refetch()}>{t.retry}</Button>}
        </section>
        <div className="-mx-5 sm:-mx-8"><GrandSummaryCard profile={profile} language={language} plan={activePlan} embedded part="approaches" /></div>
        <section aria-label="color" className="pb-6">
          {palette && <div className="mt-6"><BirthColorGuide profile={profile} plan={activePlan} language={language} /></div>}
          <ShareCardButton language={language} loading={isPending} data={data?.keySummary && data.caution ? { kicker: "", title: "", names: profile.nameKanji ? [profile.nameKanji] : [], lines: [data.keySummary], caution: data.caution, palette: palette ? (activePlan === "free" ? [palette.main] : [palette.main, palette.sub, palette.money, palette.love, palette.health, palette.mind]).map((color, i) => ({ label: (language === "ja" ? ["メイン", "サブ", "金運", "愛情", "健康", "内面"] : language === "zh-TW" ? ["主色", "副色", "財運", "愛情", "健康", "內在"] : ["Main", "Secondary", "Money", "Love", "Health", "Inner"])[i] ?? "", code: color.code })) : [], score: localLayers?.numerology.lifePath ?? 0, kind: "identity" } : null} />
        </section>
        <SacredDisclosure defaultOpen className="my-5" title={t.views}>
        {localLayers && <CoreLayersPanel layers={localLayers} profile={profile} language={language} reading={data} loading={isPending} nameDetails={nameDetails} />}
        {!experienceOnly && <section className="border-b border-primary/20 py-6"><h3 className="font-serif text-xl text-primary">{language === "ja" ? "風水｜生まれ持った吉方位タイプ（本命卦）" : "Feng shui · Your birth direction type (Ming Gua)"}</h3>{gua ? <><div className="mt-3 flex flex-wrap gap-3">{gua.branches.map(b => <div key={b.branch} className="min-w-[210px] flex-1 border-l-2 border-primary/50 bg-primary/5 p-4"><p className="font-serif text-lg text-primary">{language === "ja" ? `${b.branch === "male" ? "男性" : "女性"}の計算式 · 方位タイプ ${b.number}` : `${b.branch === "male" ? "Male" : "Female"} calculation · Type ${b.number}`}</p><p className="mt-2 text-base leading-7 text-foreground">{language === "ja" ? `活動を広げる方角 ${fengDirectionNames[b.shengQi]} · 休息を整える方角 ${fengDirectionNames[b.tianYi]} · 関係を育てる方角 ${fengDirectionNames[b.yanNian]}` : `Expansion ${b.shengQi} · Restoration ${b.tianYi} · Relationships ${b.yanNian}`}</p></div>)}</div><p className="mt-3 text-sm leading-7 text-muted-foreground">{language === "ja" ? "プロフィールの性別区分と立春基準の生年から求める、伝統的な方位の参考値です。住まいごとの吉凶や効果を保証しません。" : "A traditional direction reference based on the profile's gender category and solar year, not a property-specific assessment."}</p></> : <p className="mt-3 text-sm text-muted-foreground">{language === "ja" ? "この方位タイプの算出には生年月日と性別の入力が必要です。マイページで設定できます。" : "Add birth date and gender in your profile to view this direction type."}</p>}</section>}
         {isPending || holding ? <AgolmenLoading compact label={holding ? readingCompleteMessage[language] : t.loading} /> : isError || !data ? (
          <div className="flex min-h-40 flex-col items-start justify-center gap-3" role="alert"><p className="text-sm text-muted-foreground">{t.error}</p><Button variant="outline" onClick={() => void refetch()}>{t.retry}</Button></div>
        ) : <>
          <div className="grid grid-cols-2 gap-x-4 gap-y-4 border-b border-primary/20 py-6 sm:grid-cols-5 sm:gap-5">
            {f.axes.map((label, i) => <div key={label} className="min-w-0 border-l border-primary/35 pl-3"><p className="text-xs text-primary">{label}</p><p className="mt-2 break-words font-serif text-sm leading-6 text-foreground">{values[i] ?? f.missing}</p></div>)}
          </div>
          {!experienceOnly && data.keySummary && <section aria-label="本質の交差点" className="my-6 rounded-lg border border-primary/50 bg-gradient-to-b from-primary/15 to-transparent p-5 sm:p-6"><p className="text-xs text-primary">{language === "ja" ? "複数の参考レイヤーが交差する人物像" : "A portrait across the reference layers"}</p><p className="mt-3 font-serif text-lg leading-9 text-foreground sm:text-xl">{data.keySummary}</p></section>}
          {!experienceOnly && sections.map((text, i) => {
            const Icon = icons[i] ?? Sparkles;
            return <article key={i} className="border-b border-primary/20 py-7 last:border-b-0 sm:py-9">
              <div className="flex items-start gap-3"><span className="pt-0.5 font-serif text-xs text-primary/70">0{i + 1}</span><Icon className="size-5 shrink-0 text-primary" aria-hidden="true" /><h3 className="min-w-0 break-words font-serif text-lg leading-snug text-primary sm:text-xl">{f.sections[i]}</h3></div>
              <p className={`mt-5 max-w-3xl whitespace-pre-line break-words text-foreground ${i === 0 ? "font-serif text-[1.0625rem] leading-[2.1] sm:text-xl sm:leading-[2.05]" : "text-sm leading-8 sm:text-base"}`}>{text}</p>
            </article>;
          })}
            {!experienceOnly && <article className="border-t border-primary/25 py-7"><h3 className="font-serif text-xl text-primary">{language === "ja" ? "見落としやすい内面" : "An inner blind spot"}</h3><p className="mt-3 text-base leading-8 text-foreground">{data.caution}</p></article>}
            {!experienceOnly && <section aria-label={torisetsuTranslations[language].manual} className="border-t border-primary/25 py-7"><h3 className="font-serif text-xl text-primary">{torisetsuTranslations[language].manualTitle}</h3><div className="mt-4 space-y-5">{[data.manualCore, data.manualDecision, data.manualTiming].map((body, i) => <article key={i}><h4 className="font-serif text-lg text-primary">{t.labels[i + 3]}</h4><p className="mt-2 text-base leading-8 text-foreground">{body}</p></article>)}</div></section>}
            {!experienceOnly && <section aria-label="深層ガイド" className="border-t border-primary/25 py-7"><h3 className="font-serif text-xl text-primary">{language === "ja" ? "占術別 深層ガイド" : "Deep guide by art"}</h3><div className="mt-4 space-y-6">{([
              ["精密数秘術｜繰り返す試練と突破の才能", data.numerologyTrial],
              ["西洋占星術｜建前と本音・心の回復法", data.astroRecovery],
              ["四柱推命｜攻め時と空回りの罠", data.pillarsTiming],
              ["動物占い｜決断の癖とやる気スイッチ", data.animalSwitch],
              ["バースカラー｜日常での取り入れ方", activePlan === "free" ? "" : data.colorPractice],
              [`地球暦｜今のフェーズ${data.helio ? `「${data.helio.phase}」` : ""}`, data.helioGuide],
            ] as const).filter(([, body]) => body).map(([title, body]) => <article key={title}><h4 className="font-serif text-lg text-primary">{title}</h4><p className="mt-2 whitespace-pre-line text-base leading-8 text-foreground">{body}</p></article>)}</div></section>}
        </>}
        </SacredDisclosure>
        <div className="space-y-1 border-t border-primary/20 py-4 text-xs leading-6 text-muted-foreground"><p>{t.preview}</p><p>{f.nameNote} {e?.zodiacBoundary ? f.boundaryNote : ""} {e?.uncertainYear ? f.yearNote : ""}</p><p>{f.method}</p></div>
      </div>
      <GrandSummaryCard profile={profile} language={language} plan={activePlan} embedded part="summary" />
      {upgradeCards.length > 0 && <footer className="border-t border-primary/25 bg-background/40 p-5 sm:p-8">
        <div className="flex items-center gap-3"><Sparkles className="size-5 text-primary" aria-hidden="true" /><div className="min-w-0"><h3 className="font-serif text-lg text-primary sm:text-xl">{p.sectionTitle}</h3><p className="mt-1 text-xs text-muted-foreground">{p.sectionSub}</p></div></div>
        <div className="mt-5 -mx-5 flex snap-x snap-mandatory gap-3 overflow-x-auto px-5 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:mx-0 sm:grid sm:grid-cols-2 sm:gap-4 sm:overflow-visible sm:px-0 sm:pb-0">
          {upgradeCards.map((card) => {
            const Icon = planIcons[card.id];
            const vip = card.id === "vip" || card.id === "b2b-premium";
            return <article key={card.id} className={`flex w-[84%] min-w-[84%] snap-start flex-col rounded-lg border p-4 sm:w-auto sm:min-w-0 sm:p-5 ${vip ? "border-primary/50 bg-gradient-to-b from-primary/20 via-card/80 to-card/70 shadow-champagne" : "border-primary/25 bg-card/60"}`}>
              <div className="flex items-center justify-between gap-2">
                <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] leading-none ${vip ? "bg-champagne-gradient font-medium text-primary-foreground" : "border border-primary/45 text-primary"}`}>{card.badge}</span>
                <Icon className={`size-5 shrink-0 ${vip ? "text-(--gold-glow)" : "text-primary"}`} aria-hidden="true" />
              </div>
              <h4 className="mt-3 break-words font-serif text-base leading-snug text-foreground sm:text-lg">{card.name}</h4>
              <p className="mt-2 break-words text-xs leading-6 text-primary sm:text-[13px]">{card.catch}</p>
              <ul className="mt-4 flex-1 space-y-2.5">
                {card.features.map((feat) => <li key={feat} className="flex items-start gap-2"><Check className={`mt-0.5 size-3.5 shrink-0 ${vip ? "text-(--gold-glow)" : "text-primary"}`} aria-hidden="true" /><span className="min-w-0 break-words text-xs leading-5 text-foreground/90">{feat}</span></li>)}
              </ul>
              <Button type="button" variant={vip ? "default" : "outline"} disabled={currentPlan === card.id} onClick={() => onSelectPlan ? onSelectPlan(card.id) : setDialogPlan(card.id)} className={`mt-4 h-11 w-full whitespace-normal text-xs leading-5 ${vip ? "shadow-champagne" : "border-primary/40 text-primary hover:bg-primary/10"}`}>{currentPlan === card.id ? "利用中" : card.cta}</Button>
            </article>;
          })}
        </div>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-2"><p className="text-xs leading-5 text-muted-foreground">{p.nextStepNote}</p><Button variant="link" className="h-auto p-0 text-xs" onClick={onDiagnosis}>{t.goToArts}<ArrowUpRight className="size-3" /></Button></div>
        <Dialog open={dialogPlan !== null} onOpenChange={(open) => { if (!open) setDialogPlan(null); }}>
          <DialogContent className="max-w-sm rounded-lg border-primary/40 bg-card p-5 text-left sm:p-6">
            {(() => { const card = p.cards.find((c) => c.id === dialogPlan); if (!card) return null;
              return <>
                <DialogTitle className="break-words font-serif text-lg text-gradient-gold">{card.name}</DialogTitle>
                <DialogDescription className="mt-2 break-words text-sm leading-6 text-primary">{card.catch}</DialogDescription>
                <ul className="mt-4 space-y-2.5">
                  {card.features.map((feat) => <li key={feat} className="flex items-start gap-2"><Check className="mt-0.5 size-3.5 shrink-0 text-primary" aria-hidden="true" /><span className="min-w-0 break-words text-xs leading-5 text-foreground/90">{feat}</span></li>)}
                </ul>
                <p className="mt-4 text-[11px] leading-5 text-muted-foreground">{p.dialogNote}</p>
                <Button variant="outline" className="mt-4 w-full border-primary/40 text-primary hover:bg-primary/10" onClick={() => setDialogPlan(null)}>{p.close}</Button>
              </>; })()}
          </DialogContent>
        </Dialog>
      </footer>}
    </section>
  );
}
