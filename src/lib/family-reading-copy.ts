import type { Language } from './translations';
export const familyReadingCopy: Record<Language,{generate:string;pending:string;failed:string;preview:string}> = {
  ja:{generate:'6機能の総合分析を生成・保存',pending:'6機能の分析を生成しています。保存後に表示されます。',failed:'生成が完了しませんでした。自動再生成は停止しています。',preview:'表示確認では参考分析のみ表示します。AI生成・保存には実際のファミリープランが必要です。'},
  en:{generate:'Generate and save all six analyses',pending:'Generating six analyses. They will appear after saving.',failed:'Generation did not complete. Automatic regeneration is stopped.',preview:'Preview shows reference analysis only. AI generation requires an actual Family membership.'},
  'zh-CN':{generate:'生成并保存六项综合分析',pending:'正在生成六项分析，保存后显示。',failed:'生成未完成，已停止自动重新生成。',preview:'预览仅显示参考分析。AI生成需要实际家庭方案。'},
  'zh-TW':{generate:'生成並儲存六項綜合分析',pending:'正在生成六項分析，儲存後顯示。',failed:'生成未完成，已停止自動重新生成。',preview:'預覽僅顯示參考分析。AI生成需要實際家庭方案。'},
  ko:{generate:'6가지 종합 분석 생성·저장',pending:'6가지 분석 생성 중입니다. 저장 후 표시됩니다.',failed:'생성이 완료되지 않았습니다. 자동 재생성을 중단했습니다.',preview:'미리보기는 참고 분석만 표시합니다. AI 생성에는 실제 패밀리 가입이 필요합니다.'},
  es:{generate:'Generar y guardar los seis análisis',pending:'Generando seis análisis. Se mostrarán al guardarse.',failed:'La generación no terminó. La repetición automática está detenida.',preview:'La vista previa solo muestra referencias. La generación IA requiere una membresía Familia real.'},
  fr:{generate:'Générer et enregistrer les six analyses',pending:'Génération des six analyses. Affichage après enregistrement.',failed:'La génération n’a pas abouti. La répétition automatique est arrêtée.',preview:'L’aperçu affiche des références uniquement. La génération IA exige une véritable offre Famille.'},
};