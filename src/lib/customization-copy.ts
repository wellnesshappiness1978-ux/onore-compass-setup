import type { Language } from './translations';
type Copy = { background: string; parts: string; icons: string; save: string; saved: string; preview: string; locked: string };
export const customizationCopy: Record<Language, Copy> = {
  ja: { background: '背景', parts: '金枠・パーツ', icons: 'アイコン', save: '組み合わせを保存', saved: '保存しました', preview: '試着', locked: '未解放' },
  en: { background: 'Background', parts: 'Frame & parts', icons: 'Icons', save: 'Save combination', saved: 'Saved', preview: 'Preview', locked: 'Locked' },
  'zh-CN': { background: '背景', parts: '金框与配件', icons: '图标', save: '保存组合', saved: '已保存', preview: '试用', locked: '未解锁' },
  'zh-TW': { background: '背景', parts: '金框與配件', icons: '圖示', save: '儲存組合', saved: '已儲存', preview: '試用', locked: '未解鎖' },
  ko: { background: '배경', parts: '프레임·장식', icons: '아이콘', save: '조합 저장', saved: '저장됨', preview: '미리보기', locked: '잠김' },
  es: { background: 'Fondo', parts: 'Marco y adornos', icons: 'Iconos', save: 'Guardar combinación', saved: 'Guardado', preview: 'Vista previa', locked: 'Bloqueado' },
  fr: { background: 'Fond', parts: 'Cadre et ornements', icons: 'Icônes', save: 'Enregistrer la combinaison', saved: 'Enregistré', preview: 'Aperçu', locked: 'Verrouillé' },
};