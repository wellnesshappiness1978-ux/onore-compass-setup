import points from './japan-birthplace-centroids.json';
import countries from './address-countries.json';
import type { Language } from './translations';

export { countries };
export type AddressRegions = Record<string, { name: string; cities: string[] }>;
/** Match the shared prefecture-translation order, never the centroid JSON key order. */
export const japaneseRegions = [
  '北海道', '青森県', '岩手県', '宮城県', '秋田県', '山形県', '福島県',
  '茨城県', '栃木県', '群馬県', '埼玉県', '千葉県', '東京都', '神奈川県',
  '新潟県', '富山県', '石川県', '福井県', '山梨県', '長野県', '岐阜県',
  '静岡県', '愛知県', '三重県', '滋賀県', '京都府', '大阪府', '兵庫県',
  '奈良県', '和歌山県', '鳥取県', '島根県', '岡山県', '広島県', '山口県',
  '徳島県', '香川県', '愛媛県', '高知県', '福岡県', '佐賀県', '長崎県',
  '熊本県', '大分県', '宮崎県', '鹿児島県', '沖縄県',
];
export function japaneseCities(region: string) {
  return Object.keys(points.municipalities).filter(name => name.startsWith(region)).map(name => name.slice(region.length)).sort();
}
/** ISO country identity is stored with overseas regions, independent of UI language. */
export function addressCountry(place: string) { return /^([A-Z]{2}) · /.exec(place)?.[1] ?? 'JP'; }
export function addressRegion(place: string) { return place.replace(/^[A-Z]{2} · /, ''); }
export function storedBirthRegion(country: string, region: string) { return country === 'JP' ? region : `${country} · ${region}`; }
export function countryLabel(code: string, language: Language) {
  return new Intl.DisplayNames([language], { type: 'region' }).of(code) ?? code;
}
type Copy = { country: string; region: string; city: string; manual: string; important: string; loading: string; unavailable: string };
export const birthAddressCopy: Record<Language, Copy> = {
  ja: { country: '出生国・地域', region: '出生地（都道府県・地域）', city: '市区町村', manual: '手入力で補正', important: '重要設定', loading: '候補を読み込み中…', unavailable: '候補を取得できませんでした。手入力で補正できます。' },
  en: { country: 'Birth country / territory', region: 'Birth state / region', city: 'City / municipality', manual: 'Edit manually', important: 'Important settings', loading: 'Loading locations…', unavailable: 'Locations unavailable. You can enter them manually.' },
  'zh-CN': { country: '出生国家／地区', region: '出生省／地区', city: '市／区／县', manual: '手动修正', important: '重要设置', loading: '正在读取地点…', unavailable: '无法读取候选地点，可手动输入。' },
  'zh-TW': { country: '出生國家／地區', region: '出生縣市／地區', city: '市／區／鄉鎮', manual: '手動修正', important: '重要設定', loading: '正在讀取地點…', unavailable: '無法讀取候選地點，可手動輸入。' },
  ko: { country: '출생 국가 / 지역', region: '출생 도 / 지역', city: '시 / 군 / 구', manual: '직접 수정', important: '중요 설정', loading: '지역 불러오는 중…', unavailable: '지역 목록을 불러오지 못했습니다. 직접 입력할 수 있습니다.' },
  es: { country: 'País / territorio de nacimiento', region: 'Estado / región de nacimiento', city: 'Ciudad / municipio', manual: 'Corregir manualmente', important: 'Ajustes importantes', loading: 'Cargando lugares…', unavailable: 'Lugares no disponibles. Puedes escribirlos manualmente.' },
  fr: { country: 'Pays / territoire de naissance', region: 'Région de naissance', city: 'Ville / commune', manual: 'Corriger manuellement', important: 'Réglages importants', loading: 'Chargement des lieux…', unavailable: 'Lieux indisponibles. Vous pouvez les saisir manuellement.' },
};