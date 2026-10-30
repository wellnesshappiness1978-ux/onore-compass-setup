import type { Plan } from "./design-modes";
import { PLAN_COMPATIBILITY_LIMITS } from './plan-usage';

/** A per-device preview allowance; this is not a server-enforced entitlement. */
export const quickCompatibilityLimit = PLAN_COMPATIBILITY_LIMITS;
export const localDay = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`; };
export const quickUsageKey = (birthDate: string, plan: Plan) => `onore-quick-compat:${birthDate}:${plan}:${localDay()}`;
export const quickReading = (mine: string, theirs: string) => {
  const a = [...mine.replace(/\D/g, "")].reduce((n, c) => n + Number(c), 0);
  const b = [...theirs.replace(/\D/g, "")].reduce((n, c) => n + Number(c), 0);
  const gap = Math.abs(a - b) % 9;
  const same = gap <= 2;
  return {
    same,
    score: 63 + ((a * 7 + b * 11) % 32),
    love: same ? "生年月日の数字の傾向が近い二人。惹かれるのは会話のテンポ。相手の好意を先読みせず、望む距離感を言葉で確認すると安心が続きます。" : "生年月日の数字に差がある二人。惹かれるのは自分にない視点。熱量が異なるときは急いで答えを求めず、互いの優先順位を聞きましょう。",
    friend: same ? "近いペースを保ちやすい組み合わせ。連絡頻度を決めつけず、近況を短く共有する関係が長続きの鍵です。" : "異なるペースが刺激になる組み合わせ。一緒に過ごす時間と一人の時間を分けて尊重すると、無理のない友情を育てられます。",
    business: same ? "進め方が似ているため合意は早め。片方が企画、もう片方が確認を担い、見落としを補う役割分担を試しましょう。" : "視点の違いを役割に変えましょう。一人が案を広げ、もう一人が期限と条件を整理すると、議論を実行へつなげやすくなります。",
    overall: same ? "同じ前提だと思い込むと小さな不一致を見逃します。重要な予定は『いつ・誰が・何を』まで確かめることが関係を円滑にします。" : "結論を出す速度の差が衝突のきっかけ。返答の期限を先に決め、お互いの考える時間を守るのが鍵です。",
  };
};
