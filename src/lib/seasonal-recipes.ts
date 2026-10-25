import type { Element } from './ai/five-elements';
import type { Language } from './translations';

export type Season = 'spring' | 'summer' | 'autumn' | 'winter';
/** boost = brisk, bright dishes for high-rhythm days; restore = warm, gentle dishes for low-rhythm days. */
export type Rhythm = 'boost' | 'restore';
type Course = 'main' | 'soup' | 'drink' | 'side' | 'dessert';
type N = Record<Language, string>;
const n = (ja: string, en: string, zhCN: string, zhTW: string, ko: string, es: string, fr: string): N => ({ ja, en, 'zh-CN': zhCN, 'zh-TW': zhTW, ko, es, fr });

export type SeasonalRecipe = { id: string; element: Element; season: Season; rhythm: Rhythm; course: Course; names: N; ingredients: { id: string; amount: string }[]; method: string };
const r = (id: string, course: Course, season: Season, element: Element, rhythm: Rhythm, method: string, names: N, ing: [string, string][]): SeasonalRecipe =>
  ({ id, course, season, element, rhythm, method, names, ingredients: ing.map(([i, amount]) => ({ id: i, amount })) });

export const seasonalIngredients: Record<string, N> = {
  bamboo: n('たけのこ（水煮）', 'Boiled bamboo shoots', '水煮竹笋', '水煮竹筍', '삶은 죽순', 'Brotes de bambú cocidos', 'Pousses de bambou cuites'),
  cabbage: n('春キャベツ', 'Spring cabbage', '春季卷心菜', '春季高麗菜', '봄 양배추', 'Col de primavera', 'Chou de printemps'),
  eggplant: n('なす', 'Eggplant', '茄子', '茄子', '가지', 'Berenjena', 'Aubergine'),
  saury: n('さんま', 'Pacific saury', '秋刀鱼', '秋刀魚', '꽁치', 'Paparda del Pacífico', 'Balaou du Pacifique'),
  nanohana: n('菜の花', 'Rapeseed blossoms', '油菜花', '油菜花', '유채꽃 나물', 'Brotes de colza', 'Pousses de colza'),
  okra: n('オクラ', 'Okra', '秋葵', '秋葵', '오크라', 'Okra', 'Gombo'),
  watermelon: n('すいか', 'Watermelon', '西瓜', '西瓜', '수박', 'Sandía', 'Pastèque'),
  amazake: n('米麹甘酒', 'Rice-koji amazake', '米曲甜酒', '米麴甜酒', '쌀누룩 아마자케', 'Amazake de koji', 'Amazake au koji'),
  asparagus: n('アスパラガス', 'Asparagus', '芦笋', '蘆筍', '아스파라거스', 'Espárragos', 'Asperges'),
  snappea: n('スナップえんどう', 'Snap peas', '甜豆', '甜豆', '스냅완두', 'Tirabeques', 'Pois mange-tout'),
  taro: n('里芋', 'Taro', '芋头', '芋頭', '토란', 'Taro', 'Taro'),
  anko: n('つぶあん', 'Sweet red-bean paste', '红豆沙', '紅豆沙', '팥앙금', 'Pasta de judía roja', 'Pâte de haricots rouges'),
  kiwi: n('キウイ', 'Kiwi', '猕猴桃', '奇異果', '키위', 'Kiwi', 'Kiwi'),
  mango: n('マンゴー', 'Mango', '芒果', '芒果', '망고', 'Mango', 'Mangue'),
  pear: n('梨', 'Asian pear', '梨', '梨', '배', 'Pera asiática', 'Poire nashi'),
};

export const seasonalRecipes: SeasonalRecipe[] = [
  // ── Main ──
  r('bamboo-rice', 'main', 'spring', 'wood', 'restore', 'rice', n('たけのこご飯', 'Bamboo shoot rice', '竹笋炊饭', '竹筍炊飯', '죽순밥', 'Arroz con brotes de bambú', 'Riz aux pousses de bambou'), [['rice', '300 g'], ['bamboo', '120 g'], ['friedtofu', '1'], ['dashi', '360 ml'], ['soy', '20 ml']]),
  r('cabbage-pork-miso', 'main', 'spring', 'wood', 'boost', 'stir', n('春キャベツと豚肉の味噌炒め', 'Spring cabbage and pork miso stir-fry', '春卷心菜猪肉味噌炒', '春高麗菜豬肉味噌炒', '봄양배추 돼지고기 된장볶음', 'Salteado de col y cerdo con miso', 'Sauté de chou et porc au miso'), [['cabbage', '250 g'], ['pork', '160 g'], ['miso', '20 g'], ['oil', '10 ml']]),
  r('eggplant-mapo', 'main', 'summer', 'fire', 'boost', 'stir', n('なすの味噌麻婆炒め', 'Miso mapo eggplant', '味噌麻婆茄子', '味噌麻婆茄子', '된장 마파 가지', 'Berenjena mapo con miso', 'Aubergines mapo au miso'), [['eggplant', '3'], ['mince', '150 g'], ['miso', '20 g'], ['ginger', '10 g'], ['oil', '15 ml']]),
  r('cold-pork-shabu', 'main', 'summer', 'fire', 'restore', 'greens', n('冷しゃぶサラダ', 'Chilled pork shabu salad', '冷涮猪肉沙拉', '冷涮豬肉沙拉', '차가운 돼지 샤브 샐러드', 'Ensalada de cerdo shabu fría', 'Salade de porc shabu froide'), [['pork', '200 g'], ['cucumber', '1'], ['tomato', '1'], ['ponzu', '30 ml']]),
  r('mushroom-rice', 'main', 'autumn', 'earth', 'restore', 'rice', n('きのこの炊き込みご飯', 'Mixed mushroom rice', '蘑菇炊饭', '菇類炊飯', '버섯 솥밥', 'Arroz con setas', 'Riz aux champignons'), [['rice', '300 g'], ['mushroom', '150 g'], ['carrot', '40 g'], ['dashi', '360 ml'], ['soy', '20 ml']]),
  r('saury-salt-grill', 'main', 'autumn', 'metal', 'boost', 'grill', n('さんまの塩焼き 大根おろし添え', 'Salt-grilled saury with grated daikon', '盐烤秋刀鱼配萝卜泥', '鹽烤秋刀魚佐蘿蔔泥', '꽁치 소금구이와 무즙', 'Paparda a la sal con daikon', 'Balaou grillé au sel et daikon'), [['saury', '2'], ['salt', '2 g'], ['daikon', '100 g'], ['lemon', '1/2']]),
  r('yellowtail-teriyaki', 'main', 'winter', 'water', 'boost', 'grill', n('ぶりの照り焼き', 'Yellowtail teriyaki', '照烧鰤鱼', '照燒鰤魚', '방어 데리야키', 'Pez limón teriyaki', 'Sériole teriyaki'), [['yellowtail', '2 fillets'], ['soy', '30 ml'], ['sugar', '10 g'], ['ginger', '5 g']]),
  r('oden-stew', 'main', 'winter', 'earth', 'restore', 'simmer', n('大根と卵のおでん風煮込み', 'Oden-style daikon and egg stew', '关东煮风萝卜鸡蛋炖', '關東煮風蘿蔔雞蛋燉', '어묵탕풍 무 달걀 조림', 'Guiso oden de daikon y huevo', 'Ragoût oden de daikon et œuf'), [['daikon', '300 g'], ['egg', '2'], ['friedtofu', '2'], ['dashi', '600 ml'], ['soy', '20 ml']]),
  // ── Soup ──
  r('nanohana-clear-soup', 'soup', 'spring', 'wood', 'restore', 'soup', n('菜の花と豆腐のすまし汁', 'Clear soup with rapeseed blossoms and tofu', '油菜花豆腐清汤', '油菜花豆腐清湯', '유채꽃 두부 맑은국', 'Sopa clara de colza y tofu', 'Bouillon clair colza et tofu'), [['nanohana', '80 g'], ['tofu', '100 g'], ['dashi', '400 ml'], ['salt', '1 g']]),
  r('new-onion-soup', 'soup', 'spring', 'metal', 'restore', 'soup', n('新玉ねぎの丸ごとスープ', 'Whole spring onion soup', '整颗新洋葱汤', '整顆新洋蔥湯', '햇양파 통째 수프', 'Sopa de cebolla tierna entera', 'Soupe d\u2019oignon nouveau entier'), [['onion', '2'], ['carrot', '40 g'], ['water', '500 ml'], ['salt', '2 g']]),
  r('tomato-gazpacho', 'soup', 'summer', 'fire', 'boost', 'blend', n('トマトと胡瓜の冷製スープ', 'Chilled tomato cucumber soup', '番茄黄瓜冷汤', '番茄小黃瓜冷湯', '토마토 오이 냉수프', 'Gazpacho de tomate y pepino', 'Soupe froide tomate concombre'), [['tomato', '3'], ['cucumber', '1/2'], ['onion', '20 g'], ['oil', '15 ml'], ['salt', '2 g']]),
  r('okra-miso-soup', 'soup', 'summer', 'wood', 'boost', 'miso', n('オクラと豆腐の味噌汁', 'Okra and tofu miso soup', '秋葵豆腐味噌汤', '秋葵豆腐味噌湯', '오크라 두부 된장국', 'Sopa de miso con okra y tofu', 'Soupe miso gombo et tofu'), [['okra', '6'], ['tofu', '100 g'], ['dashi', '400 ml'], ['miso', '25 g']]),
  r('sweetpotato-potage', 'soup', 'autumn', 'earth', 'restore', 'soup', n('さつまいものポタージュ', 'Sweet potato potage', '红薯浓汤', '地瓜濃湯', '고구마 포타주', 'Crema de boniato', 'Velouté de patate douce'), [['sweetpotato', '200 g'], ['onion', '50 g'], ['milk', '300 ml'], ['butter', '10 g'], ['salt', '2 g']]),
  r('kenchin-soup', 'soup', 'autumn', 'earth', 'boost', 'soup', n('根菜たっぷりけんちん汁', 'Kenchin root vegetable soup', '根菜建长汤', '根菜建長湯', '뿌리채소 겐친국', 'Sopa kenchin de raíces', 'Soupe kenchin aux racines'), [['daikon', '80 g'], ['carrot', '40 g'], ['burdock', '40 g'], ['tofu', '100 g'], ['dashi', '500 ml'], ['soy', '15 ml']]),
  r('ishikari-soup', 'soup', 'winter', 'water', 'boost', 'miso', n('鮭とじゃがいもの石狩汁', 'Ishikari salmon and potato miso soup', '石狩三文鱼土豆汤', '石狩鮭魚馬鈴薯湯', '이시카리 연어 감자국', 'Sopa Ishikari de salmón y patata', 'Soupe Ishikari saumon et pomme de terre'), [['salmon', '120 g'], ['potato', '1'], ['onion', '50 g'], ['dashi', '500 ml'], ['miso', '30 g']]),
  r('ginger-chicken-soup', 'soup', 'winter', 'fire', 'restore', 'soup', n('鶏と生姜のおかゆスープ', 'Chicken ginger rice soup', '鸡肉姜粥汤', '雞肉薑粥湯', '닭고기 생강 죽 수프', 'Sopa de arroz con pollo y jengibre', 'Soupe de riz poulet gingembre'), [['chicken', '150 g'], ['ginger', '15 g'], ['rice', '40 g'], ['water', '600 ml'], ['salt', '2 g']]),
  // ── Drink ──
  r('strawberry-milk', 'drink', 'spring', 'fire', 'boost', 'blend', n('生いちごミルク', 'Fresh strawberry milk', '鲜草莓牛奶', '鮮草莓牛奶', '생딸기 우유', 'Leche de fresa natural', 'Lait à la fraise fraîche'), [['strawberry', '150 g'], ['milk', '300 ml'], ['honey', '15 ml']]),
  r('komatsuna-smoothie', 'drink', 'spring', 'wood', 'boost', 'blend', n('小松菜とバナナのグリーンスムージー', 'Komatsuna banana green smoothie', '小松菜香蕉绿色奶昔', '小松菜香蕉綠色奶昔', '고마쓰나 바나나 그린 스무디', 'Batido verde de komatsuna y plátano', 'Smoothie vert komatsuna banane'), [['komatsuna', '60 g'], ['banana', '1'], ['soymilk', '300 ml'], ['honey', '10 ml']]),
  r('watermelon-mint-juice', 'drink', 'summer', 'water', 'restore', 'blend', n('すいかとミントのジュース', 'Watermelon mint juice', '西瓜薄荷汁', '西瓜薄荷汁', '수박 민트 주스', 'Zumo de sandía y menta', 'Jus pastèque menthe'), [['watermelon', '400 g'], ['mint', '4 leaves'], ['lemon', '1/4']]),
  r('homemade-ginger-ale', 'drink', 'summer', 'fire', 'boost', 'drink', n('自家製ジンジャーエール', 'Homemade ginger ale', '自制姜汁汽水', '自製薑汁汽水', '수제 진저에일', 'Ginger ale casero', 'Ginger ale maison'), [['ginger', '30 g'], ['honey', '30 ml'], ['lemon', '1/2'], ['sparkling', '300 ml']]),
  r('pumpkin-spice-latte', 'drink', 'autumn', 'earth', 'restore', 'blend', n('かぼちゃのスパイスラテ', 'Pumpkin spice latte', '南瓜香料拿铁', '南瓜香料拿鐵', '단호박 스파이스 라테', 'Latte especiado de calabaza', 'Latte épicé à la courge'), [['pumpkin', '80 g'], ['milk', '300 ml'], ['honey', '15 ml'], ['cinnamon', '1 g']]),
  r('apple-cinnamon-tea', 'drink', 'autumn', 'metal', 'restore', 'drink', n('りんごとシナモンのホットティー', 'Hot apple cinnamon tea', '苹果肉桂热茶', '蘋果肉桂熱茶', '사과 시나몬 핫티', 'Té caliente de manzana y canela', 'Thé chaud pomme cannelle'), [['apple', '1/2'], ['cinnamon', '1 stick'], ['honey', '15 ml'], ['water', '400 ml']]),
  r('ginger-amazake', 'drink', 'winter', 'earth', 'restore', 'drink', n('生姜入りホット甘酒', 'Hot ginger amazake', '姜味热甜酒', '薑味熱甜酒', '생강 따뜻한 아마자케', 'Amazake caliente con jengibre', 'Amazake chaud au gingembre'), [['amazake', '300 ml'], ['ginger', '5 g']]),
  r('black-sesame-latte', 'drink', 'winter', 'water', 'restore', 'drink', n('黒ごまソイラテ', 'Black sesame soy latte', '黑芝麻豆奶拿铁', '黑芝麻豆漿拿鐵', '흑임자 두유 라테', 'Latte de soja con sésamo negro', 'Latte soja au sésame noir'), [['blacksesame', '15 g'], ['soymilk', '300 ml'], ['honey', '15 ml']]),
  // ── Side ──
  r('asparagus-sesame', 'side', 'spring', 'wood', 'boost', 'greens', n('アスパラガスのごま和え', 'Asparagus with sesame dressing', '芝麻拌芦笋', '芝麻拌蘆筍', '아스파라거스 참깨무침', 'Espárragos con sésamo', 'Asperges au sésame'), [['asparagus', '6'], ['sesame', '10 g'], ['soy', '10 ml']]),
  r('snappea-egg', 'side', 'spring', 'metal', 'boost', 'stir', n('スナップえんどうと卵の炒め物', 'Snap pea and egg stir-fry', '甜豆炒蛋', '甜豆炒蛋', '스냅완두 달걀볶음', 'Salteado de tirabeques y huevo', 'Sauté de pois et œufs'), [['snappea', '120 g'], ['egg', '2'], ['oil', '10 ml'], ['salt', '1 g']]),
  r('grilled-eggplant', 'side', 'summer', 'water', 'restore', 'grill', n('焼きなすの生姜びたし', 'Grilled eggplant in ginger dashi', '姜汁高汤烤茄子', '薑汁高湯烤茄子', '구운 가지 생강 다시 절임', 'Berenjena asada en dashi', 'Aubergine grillée au dashi gingembre'), [['eggplant', '3'], ['ginger', '5 g'], ['soy', '15 ml'], ['dashi', '100 ml']]),
  r('tomato-marinade', 'side', 'summer', 'fire', 'boost', 'pickle', n('トマトと玉ねぎの和風マリネ', 'Japanese tomato onion marinade', '日式番茄洋葱腌菜', '日式番茄洋蔥醃菜', '토마토 양파 일식 마리네', 'Marinada japonesa de tomate', 'Marinade japonaise tomate oignon'), [['tomato', '2'], ['onion', '1/4'], ['vinegar', '20 ml'], ['honey', '10 ml']]),
  r('kinpira-burdock', 'side', 'autumn', 'earth', 'boost', 'stir', n('きんぴらごぼう', 'Kinpira burdock and carrot', '金平牛蒡', '金平牛蒡', '우엉 당근 긴피라', 'Kinpira de bardana y zanahoria', 'Kinpira de bardane et carotte'), [['burdock', '120 g'], ['carrot', '50 g'], ['sesame', '5 g'], ['soy', '15 ml'], ['sugar', '5 g'], ['oil', '10 ml']]),
  r('mushroom-butter-saute', 'side', 'autumn', 'metal', 'restore', 'stir', n('きのこのバター醤油ソテー', 'Butter soy mushroom sauté', '黄油酱油炒蘑菇', '奶油醬油炒菇', '버섯 버터 간장 소테', 'Setas salteadas con mantequilla y soja', 'Champignons sautés beurre soja'), [['mushroom', '200 g'], ['butter', '10 g'], ['soy', '10 ml']]),
  r('daikon-yuzu-pickle', 'side', 'winter', 'water', 'restore', 'pickle', n('大根の柚子漬け', 'Yuzu-pickled daikon', '柚子腌萝卜', '柚子醃蘿蔔', '무 유자 절임', 'Daikon encurtido con yuzu', 'Daikon mariné au yuzu'), [['daikon', '200 g'], ['yuzu', '1/2'], ['vinegar', '20 ml'], ['sugar', '10 g']]),
  r('simmered-taro', 'side', 'winter', 'earth', 'restore', 'simmer', n('里芋の煮っころがし', 'Glazed simmered taro', '酱烧芋头', '醬燒芋頭', '토란 조림', 'Taro guisado glaseado', 'Taro mijoté glacé'), [['taro', '300 g'], ['dashi', '200 ml'], ['soy', '20 ml'], ['sugar', '10 g']]),
  // ── Dessert ──
  r('strawberry-daifuku', 'dessert', 'spring', 'fire', 'boost', 'dessert', n('いちご大福', 'Strawberry daifuku', '草莓大福', '草莓大福', '딸기 찹쌀떡', 'Daifuku de fresa', 'Daifuku à la fraise'), [['strawberry', '4'], ['shiratama', '80 g'], ['anko', '120 g'], ['sugar', '15 g']]),
  r('kiwi-honey-yogurt', 'dessert', 'spring', 'wood', 'restore', 'yogurt', n('キウイのハニーヨーグルト', 'Kiwi honey yogurt', '猕猴桃蜂蜜酸奶', '奇異果蜂蜜優格', '키위 꿀 요거트', 'Yogur de kiwi y miel', 'Yaourt kiwi miel'), [['kiwi', '2'], ['yogurt', '300 g'], ['honey', '15 ml']]),
  r('watermelon-jelly', 'dessert', 'summer', 'water', 'restore', 'dessert', n('すいかの透明ゼリー', 'Clear watermelon jelly', '西瓜果冻', '西瓜果凍', '수박 젤리', 'Gelatina de sandía', 'Gelée de pastèque'), [['watermelon', '300 g'], ['gelatin', '5 g'], ['sugar', '20 g']]),
  r('mango-pudding', 'dessert', 'summer', 'fire', 'boost', 'dessert', n('マンゴープリン', 'Mango pudding', '芒果布丁', '芒果布丁', '망고 푸딩', 'Pudin de mango', 'Pudding à la mangue'), [['mango', '1'], ['milk', '200 ml'], ['gelatin', '5 g'], ['sugar', '20 g']]),
  r('sweet-potato-cake', 'dessert', 'autumn', 'earth', 'boost', 'dessert', n('焼きスイートポテト', 'Baked sweet potato cakes', '烤红薯点心', '烤地瓜點心', '구운 스위트포테이토', 'Pastelitos de boniato al horno', 'Douceurs de patate douce rôties'), [['sweetpotato', '250 g'], ['butter', '15 g'], ['sugar', '20 g'], ['egg', '1']]),
  r('pear-compote', 'dessert', 'autumn', 'metal', 'restore', 'dessert', n('梨のレモンコンポート', 'Asian pear lemon compote', '柠檬糖煮梨', '檸檬糖煮梨', '배 레몬 콩포트', 'Compota de pera con limón', 'Compote de nashi au citron'), [['pear', '1'], ['lemon', '1/4'], ['sugar', '20 g'], ['water', '200 ml']]),
  r('shiratama-zenzai', 'dessert', 'winter', 'water', 'restore', 'dessert', n('白玉ぜんざい', 'Shiratama zenzai red-bean soup', '白玉红豆汤', '白玉紅豆湯', '시라타마 단팥죽', 'Zenzai de judía roja con shiratama', 'Zenzai aux haricots rouges et shiratama'), [['anko', '200 g'], ['shiratama', '80 g'], ['water', '200 ml']]),
  r('yuzu-kanten', 'dessert', 'winter', 'metal', 'boost', 'dessert', n('柚子の寒天ゼリー', 'Yuzu agar jelly', '柚子寒天果冻', '柚子寒天果凍', '유자 한천 젤리', 'Gelatina de agar con yuzu', 'Gelée d\u2019agar au yuzu'), [['yuzu', '1'], ['agar', '2 g'], ['sugar', '30 g'], ['water', '300 ml']]),
];

/** Japanese seasons by month: spring Mar–May, summer Jun–Aug, autumn Sep–Nov, winter Dec–Feb. */
export function seasonOf(day: string): Season {
  const m = Number(day.slice(5, 7));
  return m >= 3 && m <= 5 ? 'spring' : m >= 6 && m <= 8 ? 'summer' : m >= 9 && m <= 11 ? 'autumn' : 'winter';
}
/** 23-day physical biorhythm sign at the day: non-negative = boost, negative = restore. Reference rhythm only. */
export function rhythmOf(birthDate: string | undefined, day: string): Rhythm | undefined {
  if (!birthDate || !day) return undefined;
  const d = (Date.parse(`${day}T00:00:00Z`) - Date.parse(`${birthDate}T00:00:00Z`)) / 86400000;
  if (!Number.isFinite(d)) return undefined;
  return Math.sin((2 * Math.PI * d) / 23) >= 0 ? 'boost' : 'restore';
}
