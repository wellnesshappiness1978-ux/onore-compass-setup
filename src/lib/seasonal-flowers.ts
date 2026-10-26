import narcissus from '@/assets/flower-01.jpg';
import plum from '@/assets/flower-02.jpg';
import tulip from '@/assets/flower-03.jpg';
import lilyValley from '@/assets/flower-04.jpg';
import rose from '@/assets/flower-05.jpg';
import hydrangea from '@/assets/flower-06.jpg';
import sunflower from '@/assets/flower-07.jpg';
import morningGlory from '@/assets/flower-08.jpg';
import gentian from '@/assets/flower-09.jpg';
import osmanthus from '@/assets/flower-10.jpg';
import chrysanthemum from '@/assets/flower-11.jpg';
import poinsettia from '@/assets/flower-12.jpg';
import camellia from '@/assets/flower-camellia.jpg';
import sakura from '@/assets/flower-sakura.jpg';
import yamabuki from '@/assets/flower-yamabuki.jpg';
import iris from '@/assets/flower-iris.jpg';
import lotus from '@/assets/flower-lotus.jpg';
import cosmos from '@/assets/flower-cosmos.jpg';
import lavender from '@/assets/flower-lavender.jpg';
import cyclamen from '@/assets/flower-cyclamen.jpg';
import { dayElement, type Element } from './team-analysis';
import { personal } from './day-compass';
import type { Language } from './translations';

type N = Record<Language, string>;
const n = (ja: string, en: string, zhCN: string, zhTW: string, ko: string, es: string, fr: string): N => ({ ja, en, 'zh-CN': zhCN, 'zh-TW': zhTW, ko, es, fr });

/** Each flower owns exactly one photo of itself; name and image can never diverge. */
export type SeasonalFlower = { id: string; image: string; months: number[]; element: Element; name: N; meaning: N };
const f = (id: string, image: string, months: number[], element: Element, name: N, meaning: N): SeasonalFlower => ({ id, image, months, element, name, meaning });

export const seasonalFlowers: SeasonalFlower[] = [
  f('narcissus', narcissus, [12, 1, 2], 'metal', n('スイセン', 'Narcissus', '水仙', '水仙', '수선화', 'Narciso', 'Narcisse'), n('自己愛・希望', 'Self-respect, hope', '自爱・希望', '自愛・希望', '자기애・희망', 'Amor propio, esperanza', 'Estime de soi, espoir')),
  f('plum', plum, [1, 2, 3], 'fire', n('ウメ', 'Plum blossom', '梅花', '梅花', '매화', 'Flor de ciruelo', 'Fleur de prunier'), n('忍耐・気品', 'Patience, grace', '忍耐・高雅', '忍耐・高雅', '인내・기품', 'Paciencia, elegancia', 'Patience, grâce')),
  f('camellia', camellia, [12, 1, 2, 3], 'fire', n('ツバキ', 'Camellia', '山茶花', '山茶花', '동백꽃', 'Camelia', 'Camélia'), n('控えめな優しさ・誇り', 'Modest kindness, pride', '谦逊的温柔・骄傲', '謙遜的溫柔・驕傲', '겸손한 다정함・자부심', 'Bondad discreta, orgullo', 'Douceur discrète, fierté')),
  f('cyclamen', cyclamen, [11, 12, 1], 'metal', n('シクラメン', 'Cyclamen', '仙客来', '仙客來', '시클라멘', 'Ciclamen', 'Cyclamen'), n('清らかな想い', 'Pure feelings', '纯洁的心意', '純潔的心意', '맑은 마음', 'Sentimientos puros', 'Sentiments purs')),
  f('poinsettia', poinsettia, [11, 12], 'fire', n('ポインセチア', 'Poinsettia', '一品红', '聖誕紅', '포인세티아', 'Flor de Pascua', 'Poinsettia'), n('祝福', 'Blessing', '祝福', '祝福', '축복', 'Bendición', 'Bénédiction')),
  f('tulip', tulip, [3, 4], 'wood', n('チューリップ', 'Tulip', '郁金香', '鬱金香', '튤립', 'Tulipán', 'Tulipe'), n('思いやり', 'Kindness', '体贴', '體貼', '배려', 'Consideración', 'Bienveillance')),
  f('sakura', sakura, [3, 4], 'wood', n('サクラ', 'Cherry blossom', '樱花', '櫻花', '벚꽃', 'Flor de cerezo', 'Fleur de cerisier'), n('精神の美・新たな門出', 'Inner beauty, new beginnings', '心灵之美・新的开始', '心靈之美・新的開始', '정신의 아름다움・새 출발', 'Belleza interior, nuevos comienzos', 'Beauté intérieure, nouveau départ')),
  f('yamabuki', yamabuki, [4, 5], 'earth', n('ヤマブキ', 'Japanese kerria', '棣棠花', '棣棠花', '황매화', 'Kerria japonesa', 'Corète du Japon'), n('気品・金運', 'Grace, prosperity', '高雅・财运', '高雅・財運', '기품・재물운', 'Elegancia, prosperidad', 'Grâce, prospérité')),
  f('lily-of-the-valley', lilyValley, [4, 5], 'metal', n('スズラン', 'Lily of the valley', '铃兰', '鈴蘭', '은방울꽃', 'Lirio de los valles', 'Muguet'), n('再び幸せが訪れる', 'Return of happiness', '幸福归来', '幸福歸來', '다시 찾아오는 행복', 'Regreso de la felicidad', 'Retour du bonheur')),
  f('rose', rose, [5, 6], 'fire', n('バラ', 'Rose', '玫瑰', '玫瑰', '장미', 'Rosa', 'Rose'), n('愛・美', 'Love, beauty', '爱・美', '愛・美', '사랑・아름다움', 'Amor, belleza', 'Amour, beauté')),
  f('iris', iris, [5, 6], 'water', n('カキツバタ', 'Japanese iris', '燕子花', '燕子花', '제비붓꽃', 'Iris japonés', 'Iris du Japon'), n('幸運が訪れる', 'Good fortune arrives', '好运降临', '好運降臨', '행운이 찾아온다', 'Llega la buena suerte', 'La chance arrive')),
  f('hydrangea', hydrangea, [6, 7], 'wood', n('アジサイ', 'Hydrangea', '绣球花', '繡球花', '수국', 'Hortensia', 'Hortensia'), n('辛抱強い愛・団らん', 'Patient love, togetherness', '坚韧的爱・团聚', '堅韌的愛・團聚', '인내하는 사랑・단란함', 'Amor paciente, unión', 'Amour patient, convivialité')),
  f('lavender', lavender, [6, 7], 'water', n('ラベンダー', 'Lavender', '薰衣草', '薰衣草', '라벤더', 'Lavanda', 'Lavande'), n('沈黙・期待', 'Calm, anticipation', '沉静・期待', '沉靜・期待', '침묵・기대', 'Calma, expectativa', 'Calme, attente')),
  f('sunflower', sunflower, [7, 8], 'earth', n('ヒマワリ', 'Sunflower', '向日葵', '向日葵', '해바라기', 'Girasol', 'Tournesol'), n('憧れ・あなただけを見つめる', 'Adoration', '憧憬・只注视你', '憧憬・只注視你', '동경・당신만을 바라봄', 'Adoración', 'Adoration')),
  f('morning-glory', morningGlory, [7, 8, 9], 'water', n('アサガオ', 'Morning glory', '牵牛花', '牽牛花', '나팔꽃', 'Campanilla', 'Volubilis'), n('固い絆', 'Firm bonds', '坚固的羁绊', '堅固的羈絆', '굳은 인연', 'Lazos firmes', 'Liens solides')),
  f('lotus', lotus, [7, 8], 'metal', n('ハス', 'Lotus', '莲花', '蓮花', '연꽃', 'Loto', 'Lotus'), n('清らかな心', 'Pure heart', '清净之心', '清淨之心', '맑은 마음', 'Corazón puro', 'Cœur pur')),
  f('gentian', gentian, [9, 10], 'water', n('リンドウ', 'Gentian', '龙胆', '龍膽', '용담', 'Genciana', 'Gentiane'), n('誠実', 'Sincerity', '诚实', '誠實', '성실', 'Sinceridad', 'Sincérité')),
  f('cosmos', cosmos, [9, 10], 'fire', n('コスモス', 'Cosmos', '波斯菊', '波斯菊', '코스모스', 'Cosmos', 'Cosmos'), n('調和・真心', 'Harmony, sincerity', '和谐・真心', '和諧・真心', '조화・진심', 'Armonía, sinceridad', 'Harmonie, sincérité')),
  f('osmanthus', osmanthus, [9, 10], 'earth', n('キンモクセイ', 'Osmanthus', '桂花', '桂花', '금목서', 'Osmanto', 'Osmanthe'), n('謙虚・真実', 'Humility, truth', '谦虚・真实', '謙虛・真實', '겸손・진실', 'Humildad, verdad', 'Humilité, vérité')),
  f('chrysanthemum', chrysanthemum, [10, 11], 'metal', n('キク', 'Chrysanthemum', '菊花', '菊花', '국화', 'Crisantemo', 'Chrysanthème'), n('高貴・長寿', 'Nobility, longevity', '高贵・长寿', '高貴・長壽', '고귀・장수', 'Nobleza, longevidad', 'Noblesse, longévité')),
];

/** 生 (generating) cycle: the element that nourishes the key. */
const generatedBy: Record<Element, Element> = { wood: 'water', fire: 'wood', earth: 'fire', metal: 'earth', water: 'metal' };
const ALL: Element[] = ['wood', 'fire', 'earth', 'metal', 'water'];

export const flowersInSeason = (month: number) => seasonalFlowers.filter(x => x.months.includes(month));
/** Rotation key: switches automatically at local 00:00 on the 1st of each month. */
export const monthlyRotationKey = (date: Date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

export type FlowerPick = { flower: SeasonalFlower; rotation: string; group: boolean; support: Element; rhythm: 'boost' | 'restore'; missing: Element[] };

/** Deterministic in-season pick that reinforces each subject's day-pillar element (own element on high-rhythm months, its nourishing element on low months); groups add a harmony bonus for elements nobody holds. */
export function pickMonthlyFlower(birthDates: string[], date: Date): FlowerPick {
  const month = date.getMonth() + 1;
  const mid = new Date(date.getFullYear(), date.getMonth(), 15);
  const dates = birthDates.filter(Boolean);
  const group = dates.length > 1;
  const weight: Record<Element, number> = { wood: 0, fire: 0, earth: 0, metal: 0, water: 0 };
  const held = new Set<Element>();
  let total = 0;
  for (const b of dates) {
    const own = dayElement(b);
    held.add(own);
    const rhythm = personal(b, mid).total;
    total += rhythm;
    const boost = rhythm >= 50;
    weight[own] += boost ? 2 : 1;
    weight[generatedBy[own]] += boost ? 1 : 2;
  }
  const missing = dates.length ? ALL.filter(e => !held.has(e)) : [];
  if (group) for (const e of missing) weight[e] += 0.75;
  const candidates = flowersInSeason(month);
  const rotation = monthlyRotationKey(date);
  const salt = [...rotation].reduce((s, c) => s + c.charCodeAt(0), 0);
  const ranked = candidates.map((fl, i) => ({ fl, score: weight[fl.element] * 10 + ((i + salt) % candidates.length) / 100 })).sort((a, b) => b.score - a.score);
  const flower = ranked[0]!.fl;
  const rhythm: 'boost' | 'restore' = dates.length && total / dates.length < 50 ? 'restore' : 'boost';
  return { flower, rotation, group, support: flower.element, rhythm, missing };
}

const elementNames: Record<Language, Record<Element, string>> = {
  ja: { wood: '木', fire: '火', earth: '土', metal: '金', water: '水' },
  en: { wood: 'Wood', fire: 'Fire', earth: 'Earth', metal: 'Metal', water: 'Water' },
  'zh-CN': { wood: '木', fire: '火', earth: '土', metal: '金', water: '水' },
  'zh-TW': { wood: '木', fire: '火', earth: '土', metal: '金', water: '水' },
  ko: { wood: '목', fire: '화', earth: '토', metal: '금', water: '수' },
  es: { wood: 'Madera', fire: 'Fuego', earth: 'Tierra', metal: 'Metal', water: 'Agua' },
  fr: { wood: 'Bois', fire: 'Feu', earth: 'Terre', metal: 'Métal', water: 'Eau' },
};

export const flowerCopy: Record<Language, { title: string; group: string; meaning: string; season: string; reason: (p: FlowerPick) => string; action: (p: FlowerPick) => string; rotation: string }> = {
  ja: { title: '今月のラッキーフラワー', group: 'グループ総合運気アップフラワー', meaning: '花言葉', season: '旬の花', rotation: '毎月1日 0:00に自動で切り替わります',
    reason: p => p.group ? `今が旬の${p.flower.name.ja}は「${elementNames.ja[p.support]}」の気を持ち、メンバー全員の五行を最も多く支えます。${p.missing.length ? `グループに不足する「${p.missing.map(e => elementNames.ja[e]).join('・')}」も補い、` : ''}全体の調和を高めます。` : `今が旬の${p.flower.name.ja}は「${elementNames.ja[p.support]}」の気を持ち、${p.rhythm === 'boost' ? '今月の好調なリズムをさらに伸ばします' : '今月の調整期のリズムを補い、立て直しを助けます'}。`,
    action: p => p.group ? `共有スペースに${p.flower.name.ja}を一輪飾り、月初に今月の目標を全員で一つ決めましょう。` : `${p.flower.name.ja}を目に入る場所に飾り、見るたびに今月の目標を一つ確認しましょう。` },
  en: { title: "This month's lucky flower", group: 'Group harmony flower', meaning: 'Meaning', season: 'In season', rotation: 'Changes automatically at 00:00 on the 1st',
    reason: p => p.group ? `${p.flower.name.en}, in season now, carries ${elementNames.en[p.support]} energy that supports the most members' elements${p.missing.length ? ` and adds the missing ${p.missing.map(e => elementNames.en[e]).join('/')}` : ''}, raising group harmony.` : `${p.flower.name.en}, in season now, carries ${elementNames.en[p.support]} energy that ${p.rhythm === 'boost' ? "extends this month's strong rhythm" : "supports this month's recovery rhythm"}.`,
    action: p => p.group ? `Place ${p.flower.name.en} in a shared space and agree on one goal together early in the month.` : `Keep ${p.flower.name.en} where you see it and recall one monthly goal each time.` },
  'zh-CN': { title: '本月幸运花卉', group: '团体整体运势花卉', meaning: '花语', season: '当季花', rotation: '每月1日0:00自动更新',
    reason: p => `当季的${p.flower.name['zh-CN']}带有「${elementNames['zh-CN'][p.support]}」之气，${p.group ? '最能支撑全体成员的五行，提升团体和谐' : p.rhythm === 'boost' ? '能延续本月的好状态' : '能补充本月调整期的节奏'}。`,
    action: p => `把${p.flower.name['zh-CN']}放在常看到的地方，${p.group ? '月初与大家共同确定一个目标' : '每次看到时确认一个本月目标'}。` },
  'zh-TW': { title: '本月幸運花卉', group: '團體整體運勢花卉', meaning: '花語', season: '當季花', rotation: '每月1日0:00自動更新',
    reason: p => `當季的${p.flower.name['zh-TW']}帶有「${elementNames['zh-TW'][p.support]}」之氣，${p.group ? '最能支撐全體成員的五行，提升團體和諧' : p.rhythm === 'boost' ? '能延續本月的好狀態' : '能補充本月調整期的節奏'}。`,
    action: p => `把${p.flower.name['zh-TW']}放在常看到的地方，${p.group ? '月初與大家共同確定一個目標' : '每次看到時確認一個本月目標'}。` },
  ko: { title: '이번 달 행운의 꽃', group: '그룹 종합 운기 상승 꽃', meaning: '꽃말', season: '제철 꽃', rotation: '매월 1일 0:00에 자동으로 바뀝니다',
    reason: p => `지금이 제철인 ${p.flower.name.ko}은(는) '${elementNames.ko[p.support]}'의 기운으로 ${p.group ? '멤버 전원의 오행을 가장 많이 받쳐 그룹의 조화를 높입니다' : p.rhythm === 'boost' ? '이번 달의 좋은 리듬을 더 키웁니다' : '이번 달 조정기의 리듬을 보완합니다'}.`,
    action: p => `${p.flower.name.ko}을(를) 눈에 띄는 곳에 두고 ${p.group ? '월초에 함께 목표 하나를 정하세요' : '볼 때마다 이번 달 목표 하나를 확인하세요'}.` },
  es: { title: 'Flor de suerte del mes', group: 'Flor de armonía del grupo', meaning: 'Significado', season: 'De temporada', rotation: 'Cambia automáticamente el día 1 a las 00:00',
    reason: p => `${p.flower.name.es}, de temporada, aporta energía ${elementNames.es[p.support]} que ${p.group ? 'apoya los elementos de más miembros y eleva la armonía del grupo' : p.rhythm === 'boost' ? 'amplía el buen ritmo de este mes' : 'sostiene el ritmo de recuperación de este mes'}.`,
    action: p => `Coloca ${p.flower.name.es} a la vista y ${p.group ? 'acordad juntos una meta a inicio de mes' : 'recuerda una meta del mes cada vez que la veas'}.` },
  fr: { title: 'Fleur porte-bonheur du mois', group: 'Fleur d’harmonie du groupe', meaning: 'Signification', season: 'De saison', rotation: 'Change automatiquement le 1er à 00:00',
    reason: p => `${p.flower.name.fr}, de saison, porte l’énergie ${elementNames.fr[p.support]} qui ${p.group ? 'soutient les éléments du plus grand nombre et renforce l’harmonie du groupe' : p.rhythm === 'boost' ? 'prolonge le bon rythme du mois' : 'soutient le rythme de récupération du mois'}.`,
    action: p => `Placez ${p.flower.name.fr} bien en vue et ${p.group ? 'fixez ensemble un objectif en début de mois' : 'rappelez-vous un objectif du mois à chaque regard'}.` },
};
