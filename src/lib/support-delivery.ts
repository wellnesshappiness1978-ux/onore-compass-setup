import type { Language } from './translations';

// A user-mediated email handoff; this is not an automatic email sender.
export const SUPPORT_EMAIL = 'wellness.happiness1978@gmail.com';
export function supportMailto(ticketId: string, subject: string, message: string): string {
  const params = new URLSearchParams({
    subject: `[アゴルメンの羅針盤 / ${ticketId}] ${subject}`,
    body: `受付番号: ${ticketId}\n\n${message}`,
  });
  return `mailto:${SUPPORT_EMAIL}?${params.toString()}`;
}

type DeliveryCopy = { intro: string; notice: string; email: string };
export const supportDeliveryCopy: Record<Language, DeliveryCopy> = {
  ja: { intro: '不具合・アカウント・個人情報について受け付けます。医療・法律の相談や緊急対応窓口ではありません。', notice: '内容は受付履歴に保存されます。管理者へメールで届けるには、保存後にメールアプリを開き、送信を完了してください。自動メール送信ではありません。', email: '管理者宛てメールを開く' },
  en: { intro: 'Contact us about bugs, accounts or privacy. This is not an emergency, medical or legal advice service.', notice: 'Your request is saved. To email the administrator, open your email app after saving and complete the send there. Email is not sent automatically.', email: 'Open email to administrator' },
  'zh-CN': { intro: '受理故障、账户及隐私问题。本窗口不提供紧急、医疗或法律咨询。', notice: '内容将保存到咨询记录。保存后请打开邮件应用并完成发送，才能送达管理员。邮件不会自动发送。', email: '打开致管理员的邮件' },
  'zh-TW': { intro: '受理故障、帳戶及隱私問題。本窗口不提供緊急、醫療或法律諮詢。', notice: '內容將儲存至諮詢記錄。儲存後請開啟郵件應用程式並完成傳送，才能送達管理員。郵件不會自動傳送。', email: '開啟致管理員的郵件' },
  ko: { intro: '오류, 계정, 개인정보 문의를 받습니다. 긴급·의료·법률 상담 창구는 아닙니다.', notice: '문의 내용은 내역에 저장됩니다. 관리자에게 이메일을 보내려면 저장 후 메일 앱을 열고 전송을 완료하세요. 자동으로 이메일을 보내지는 않습니다.', email: '관리자에게 보낼 이메일 열기' },
  es: { intro: 'Atendemos incidencias, cuentas y privacidad. No es un servicio de emergencia ni de asesoría médica o legal.', notice: 'La solicitud se guarda. Para enviarla al administrador por correo, abre tu aplicación de correo después de guardar y envíala allí. No se envía automáticamente.', email: 'Abrir correo al administrador' },
  fr: { intro: 'Contactez-nous pour un bug, un compte ou la confidentialité. Ce service ne traite pas les urgences ni les conseils médicaux ou juridiques.', notice: 'La demande est enregistrée. Pour l’envoyer à l’administrateur par e-mail, ouvrez votre messagerie après l’enregistrement et envoyez-la. L’envoi n’est pas automatique.', email: 'Ouvrir un e-mail à l’administrateur' },
};