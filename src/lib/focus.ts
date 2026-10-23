import type { Language } from "@/lib/translations";
import type { Plan } from "@/lib/design-modes";
import type { TeamMember } from "@/lib/team-analysis";
import type { UserProfile } from "@/components/Onboarding";
import { groupLimit } from "@/lib/plans";

export type TargetKind = "self" | "family" | "group";
export type Focus = { goal: string; goalPreset: string; targetKind: TargetKind; targetId: string | null };
export type TeamGroup = { id: string; name: string; nickname: string; memberIds: string[] };
export const defaultFocus: Focus = { goal: "", goalPreset: "", targetKind: "self", targetId: null };
/** Reading labels are independent of the Settings subject-selector labels. */
export const selfReadingLabel: Record<Language, string> = { ja: "あなた", en: "You", "zh-CN": "你", "zh-TW": "你", ko: "당신", es: "Tú", fr: "Vous" };
export const goalPresets = ["work", "love", "family", "health", "money", "growth"] as const;

export const FOCUS_KEY = "onore-focus";
export const GROUPS_KEY = "onore-groups";

/** Whether another group may be registered on this plan. */
export const canAddGroup = (plan: Plan, count: number) => count < groupLimit[plan];

/** "グループA", "グループB", … for unnamed groups by position. */
export const autoGroupLetter = (index: number) => {
  let n = index, s = "";
  do { s = String.fromCharCode(65 + (n % 26)) + s; n = Math.floor(n / 26) - 1; } while (n >= 0);
  return s;
};
export const memberDisplayName = (m: Pick<TeamMember, "name" | "nickname">) => m.nickname?.trim() || m.name;
export const groupDisplayName = (g: TeamGroup, index: number, language: Language) =>
  g.nickname.trim() || g.name.trim() || `${focusCopy[language].groupWord}${autoGroupLetter(index)}`;

/** Saved subject identity drives navigation without changing profile names or calculations. */
export function traitsNavigationLabel(language: Language, member?: Pick<TeamMember, "name" | "nickname"> | null, group?: { group: TeamGroup; index: number } | null) {
  const name = member ? memberDisplayName(member) : group ? groupDisplayName(group.group, group.index, language) : null;
  const self: Record<Language, string> = { ja: "あなたの特性", en: "Your traits", "zh-CN": "你的特质", "zh-TW": "你的特質", ko: "당신의 특성", es: "Tus rasgos", fr: "Vos traits" };
  if (!name) return self[language];
  const labels: Record<Language, string> = { ja: `${name}${member ? "さん" : ""}の特性`, en: `${name}'s traits`, "zh-CN": `${name}的特质`, "zh-TW": `${name}的特質`, ko: `${name}의 특성`, es: `Rasgos de ${name}`, fr: `Traits de ${name}` };
  return labels[language];
}

export function memberToProfile(m: TeamMember): UserProfile {
  const gender = (["female", "male", "other", "undisclosed"] as const).find(g => g === m.gender) ?? "undisclosed";
  return {
    nameKanji: m.name, nameKana: m.nameKana ?? "", nameRomaji: "", gender,
    birthCity: m.birthCity ?? "", birthDate: m.birthDate, birthTime: m.birthTime ?? "",
    birthTimeUnknown: m.birthTimeUnknown ?? !m.birthTime, birthPlace: m.birthPlace ?? "",
    bloodType: m.bloodType ?? "", siblingOrder: m.siblingOrder ?? "",
    father: m.father ? { birthDate: m.father.birthDate, birthPlace: m.father.birthPlace ?? "", birthCity: m.father.birthCity ?? "" } : null,
    mother: m.mother ? { birthDate: m.mother.birthDate, birthPlace: m.mother.birthPlace ?? "", birthCity: m.mother.birthCity ?? "" } : null,
  };
}

/** Average of hex colors (simple RGB mean) used as an illustrative group color. */
export function mixHex(codes: string[]): string | null {
  const valid = codes.filter(c => /^#[0-9a-f]{6}$/i.test(c));
  if (!valid.length) return null;
  const sum = valid.reduce((a, c) => [a[0]! + parseInt(c.slice(1, 3), 16), a[1]! + parseInt(c.slice(3, 5), 16), a[2]! + parseInt(c.slice(5, 7), 16)], [0, 0, 0]);
  return `#${sum.map(v => Math.round(v / valid.length).toString(16).padStart(2, "0")).join("")}`;
}

export function readLocalFocus(): Focus {
  try { const v = JSON.parse(localStorage.getItem(FOCUS_KEY) ?? "null"); if (v && ["self", "family", "group"].includes(v.targetKind)) return { ...defaultFocus, ...v }; } catch { /* ignore */ }
  return defaultFocus;
}
export function readLocalGroups(): TeamGroup[] {
  try { const v = JSON.parse(localStorage.getItem(GROUPS_KEY) ?? "[]"); return Array.isArray(v) ? v.filter(g => g && typeof g.id === "string").map(g => ({ id: g.id, name: String(g.name ?? ""), nickname: String(g.nickname ?? ""), memberIds: Array.isArray(g.memberIds) ? g.memberIds : [] })) : []; } catch { return []; }
}

type Copy = {
  cardTitle: string; cardIntro: string; goalLabel: string; goalPlaceholder: string; presets: Record<typeof goalPresets[number], string>;
  targetLabel: string; self: string; family: string; group: string; choosePerson: string; chooseGroup: string; none: string; save: string; saved: string;
  groupWord: string; traitsSelf: string; traitsPerson: (n: string) => string; traitsGroup: (n: string) => string;
  viewing: (n: string) => string; backToSelf: string; artOwnerOnly: string; artOwnerOnlyBody: string;
  groupColor: string; groupMembers: string; groupHarmony: string; groupRhythm: string; groupEmpty: string; goalNote: (g: string) => string;
  familyEdit: string; groupEdit: string; nickname: string; groupName: string; members: string; add: string; edit: string; remove: string; close: string;
  groupLimitTitle: string; groupLimitBody: (limit: number) => string; seePlans: string; groupCount: (n: number, limit: number) => string; noMembers: string;
};
export const focusCopy: Record<Language, Copy> = {
  ja: { cardTitle: "目的・目標と診断対象設定(デフォルト固定)", cardIntro: "設定した目的と対象に合わせて、特性・今日の占い・相談室の内容が切り替わります。変更するまで保持されます。", goalLabel: "現在の目的・目標", goalPlaceholder: "例：秋までに新しい仕事に挑戦したい", presets: { work: "仕事", love: "恋愛", family: "家族", health: "健康", money: "お金", growth: "自己成長" }, targetLabel: "メイン診断対象", self: "本人", family: "ファミリー", group: "グループ", choosePerson: "人を選ぶ", chooseGroup: "グループを選ぶ", none: "登録がありません。ファミリータブで登録できます。", save: "保存する", saved: "目的と診断対象を保存しました", groupWord: "グループ", traitsSelf: "あなたの特性＆個別診断", traitsPerson: n => `${n}さんの特性＆個別診断`, traitsGroup: n => `${n}の特性＆グループ診断`, viewing: n => `診断対象：${n}`, backToSelf: "本人に戻す", artOwnerOnly: "ご家族・グループのアートはファミリープラン以上で解放", artOwnerOnlyBody: "ファミリープラン以上で、ご家族やグループ全員のバースカラー曼荼羅アート、および個人ごとの出生宇宙創生図が解放されます。現在は登録者ご本人の作品を表示しています。", groupColor: "グループカラー（総合相性カラー）", groupMembers: "メンバーとそれぞれの総合カラー", groupHarmony: "グループの調和度", groupRhythm: "今日のグループの平均リズム", groupEmpty: "このグループにはまだメンバーがいません。ファミリータブで追加してください。", goalNote: g => `目的「${g}」に合わせた内容です。`, familyEdit: "ファミリー登録・編集", groupEdit: "グループ登録・編集", nickname: "ニックネーム", groupName: "グループ名（任意）", members: "メンバー", add: "追加", edit: "編集", remove: "削除", close: "閉じる", groupLimitTitle: "グループ登録の上限です", groupLimitBody: l => `現在のプランで登録できるグループは${l}件までです。上位プランで登録枠が広がります。`, seePlans: "プランを見る", groupCount: (n, l) => `登録グループ ${n} / ${l}`, noMembers: "先にファミリーを登録してください。" },
  en: { cardTitle: "Goal & reading subject settings (default, kept)", cardIntro: "Traits, today's reading and consultation follow the goal and subject you set. Kept until you change it.", goalLabel: "Current goal", goalPlaceholder: "e.g. Try a new job by autumn", presets: { work: "Work", love: "Love", family: "Family", health: "Health", money: "Money", growth: "Growth" }, targetLabel: "Main subject", self: "Me", family: "Family", group: "Group", choosePerson: "Choose a person", chooseGroup: "Choose a group", none: "Nothing registered yet. Add in the Family tab.", save: "Save", saved: "Goal and subject saved", groupWord: "Group ", traitsSelf: "Your traits & personal reading", traitsPerson: n => `${n}'s traits & personal reading`, traitsGroup: n => `${n} traits & group reading`, viewing: n => `Subject: ${n}`, backToSelf: "Back to me", artOwnerOnly: "Family and group art unlocks with the Family plan", artOwnerOnlyBody: "With the Family plan or above, birth-color mandala art for your family and every group member, plus each person's Cosmic Genesis, is unlocked. Your own artwork is shown for now.", groupColor: "Group color (overall harmony color)", groupMembers: "Members and their main colors", groupHarmony: "Group harmony", groupRhythm: "Today's average group rhythm", groupEmpty: "This group has no members yet. Add them in the Family tab.", goalNote: g => `Tailored to your goal: "${g}".`, familyEdit: "Edit family", groupEdit: "Edit groups", nickname: "Nickname", groupName: "Group name (optional)", members: "Members", add: "Add", edit: "Edit", remove: "Delete", close: "Close", groupLimitTitle: "Group limit reached", groupLimitBody: l => `Your plan allows up to ${l} group(s). Higher plans allow more.`, seePlans: "See plans", groupCount: (n, l) => `Groups ${n} / ${l}`, noMembers: "Register family members first." },
  "zh-CN": { cardTitle: "目标与诊断对象设置（默认固定）", cardIntro: "特质、今日运势和咨询会根据你设定的目标与对象切换，直到你再次更改。", goalLabel: "当前目标", goalPlaceholder: "例：秋天前挑战新工作", presets: { work: "工作", love: "恋爱", family: "家庭", health: "健康", money: "金钱", growth: "自我成长" }, targetLabel: "主要诊断对象", self: "本人", family: "家人", group: "群组", choosePerson: "选择成员", chooseGroup: "选择群组", none: "尚未登记，可在家庭页添加。", save: "保存", saved: "已保存目标与对象", groupWord: "群组", traitsSelf: "你的特质与个人诊断", traitsPerson: n => `${n}的特质与个人诊断`, traitsGroup: n => `${n}的特质与群组诊断`, viewing: n => `诊断对象：${n}`, backToSelf: "切回本人", artOwnerOnly: "家人与群组艺术在家庭方案及以上解锁", artOwnerOnlyBody: "家庭方案及以上将解锁家人与群组全员的诞生色曼荼罗艺术，以及每个人的出生宇宙创生图。目前显示的是注册本人的作品。", groupColor: "群组色（综合相性色）", groupMembers: "成员与各自主色", groupHarmony: "群组协调度", groupRhythm: "今日群组平均节律", groupEmpty: "此群组还没有成员，请在家庭页添加。", goalNote: g => `已配合目标「${g}」。`, familyEdit: "家人登记・编辑", groupEdit: "群组登记・编辑", nickname: "昵称", groupName: "群组名（可选）", members: "成员", add: "添加", edit: "编辑", remove: "删除", close: "关闭", groupLimitTitle: "已达群组上限", groupLimitBody: l => `当前方案最多可登记${l}个群组，高级方案可增加。`, seePlans: "查看方案", groupCount: (n, l) => `群组 ${n} / ${l}`, noMembers: "请先登记家人。" },
  "zh-TW": { cardTitle: "目標與診斷對象設定（預設固定）", cardIntro: "特質、今日運勢和諮詢會依你設定的目標與對象切換，直到你再次變更。", goalLabel: "目前目標", goalPlaceholder: "例：秋天前挑戰新工作", presets: { work: "工作", love: "戀愛", family: "家庭", health: "健康", money: "金錢", growth: "自我成長" }, targetLabel: "主要診斷對象", self: "本人", family: "家人", group: "群組", choosePerson: "選擇成員", chooseGroup: "選擇群組", none: "尚未登記，可在家庭頁新增。", save: "儲存", saved: "已儲存目標與對象", groupWord: "群組", traitsSelf: "你的特質與個人診斷", traitsPerson: n => `${n}的特質與個人診斷`, traitsGroup: n => `${n}的特質與群組診斷`, viewing: n => `診斷對象：${n}`, backToSelf: "切回本人", artOwnerOnly: "家人與群組藝術在家庭方案以上解鎖", artOwnerOnlyBody: "家庭方案以上將解鎖家人與群組全員的誕生色曼荼羅藝術，以及每個人的出生宇宙創生圖。目前顯示的是註冊本人的作品。", groupColor: "群組色（綜合相性色）", groupMembers: "成員與各自主色", groupHarmony: "群組協調度", groupRhythm: "今日群組平均節律", groupEmpty: "此群組還沒有成員，請在家庭頁新增。", goalNote: g => `已配合目標「${g}」。`, familyEdit: "家人登記・編輯", groupEdit: "群組登記・編輯", nickname: "暱稱", groupName: "群組名（選填）", members: "成員", add: "新增", edit: "編輯", remove: "刪除", close: "關閉", groupLimitTitle: "已達群組上限", groupLimitBody: l => `目前方案最多可登記${l}個群組，高級方案可增加。`, seePlans: "查看方案", groupCount: (n, l) => `群組 ${n} / ${l}`, noMembers: "請先登記家人。" },
  ko: { cardTitle: "목표와 진단 대상 설정 (기본 고정)", cardIntro: "설정한 목표와 대상에 맞춰 특성·오늘의 운세·상담 내용이 바뀝니다. 변경할 때까지 유지됩니다.", goalLabel: "현재 목표", goalPlaceholder: "예: 가을까지 새로운 일에 도전", presets: { work: "일", love: "연애", family: "가족", health: "건강", money: "돈", growth: "자기 성장" }, targetLabel: "주요 진단 대상", self: "본인", family: "가족", group: "그룹", choosePerson: "사람 선택", chooseGroup: "그룹 선택", none: "등록된 항목이 없습니다. 가족 탭에서 등록하세요.", save: "저장", saved: "목표와 대상을 저장했습니다", groupWord: "그룹", traitsSelf: "당신의 특성 & 개별 진단", traitsPerson: n => `${n} 님의 특성 & 개별 진단`, traitsGroup: n => `${n}의 특성 & 그룹 진단`, viewing: n => `진단 대상: ${n}`, backToSelf: "본인으로", artOwnerOnly: "가족·그룹 아트는 패밀리 플랜 이상에서 해제", artOwnerOnlyBody: "패밀리 플랜 이상에서 가족과 그룹 전원의 탄생 컬러 만다라 아트, 그리고 개인별 출생 우주 창생도가 해제됩니다. 지금은 등록자 본인의 작품이 표시됩니다.", groupColor: "그룹 컬러(종합 궁합 컬러)", groupMembers: "멤버와 각자의 메인 컬러", groupHarmony: "그룹 조화도", groupRhythm: "오늘의 그룹 평균 리듬", groupEmpty: "이 그룹에 아직 멤버가 없습니다. 가족 탭에서 추가하세요.", goalNote: g => `목표 「${g}」에 맞춘 내용입니다.`, familyEdit: "가족 등록·편집", groupEdit: "그룹 등록·편집", nickname: "닉네임", groupName: "그룹 이름(선택)", members: "멤버", add: "추가", edit: "편집", remove: "삭제", close: "닫기", groupLimitTitle: "그룹 등록 한도입니다", groupLimitBody: l => `현재 플랜은 그룹을 ${l}개까지 등록할 수 있습니다. 상위 플랜에서 늘어납니다.`, seePlans: "플랜 보기", groupCount: (n, l) => `그룹 ${n} / ${l}`, noMembers: "먼저 가족을 등록하세요." },
  es: { cardTitle: "Ajustes de objetivo y persona (fijos por defecto)", cardIntro: "Rasgos, lectura del día y consulta siguen el objetivo y la persona elegidos hasta que los cambies.", goalLabel: "Objetivo actual", goalPlaceholder: "Ej.: probar un trabajo nuevo antes del otoño", presets: { work: "Trabajo", love: "Amor", family: "Familia", health: "Salud", money: "Dinero", growth: "Crecimiento" }, targetLabel: "Persona principal", self: "Yo", family: "Familia", group: "Grupo", choosePerson: "Elegir persona", chooseGroup: "Elegir grupo", none: "Aún no hay registros. Añádelos en la pestaña Familia.", save: "Guardar", saved: "Objetivo y persona guardados", groupWord: "Grupo ", traitsSelf: "Tus rasgos y lectura personal", traitsPerson: n => `Rasgos y lectura de ${n}`, traitsGroup: n => `Rasgos y lectura del grupo ${n}`, viewing: n => `Lectura de: ${n}`, backToSelf: "Volver a mí", artOwnerOnly: "El arte familiar y de grupo se desbloquea con el plan Familia", artOwnerOnlyBody: "Con el plan Familia o superior se desbloquean el mandala de colores de nacimiento de tu familia y de todo el grupo, y la Génesis Cósmica de cada persona. Por ahora se muestra tu propia obra.", groupColor: "Color del grupo (armonía global)", groupMembers: "Miembros y su color principal", groupHarmony: "Armonía del grupo", groupRhythm: "Ritmo medio del grupo hoy", groupEmpty: "Este grupo aún no tiene miembros. Añádelos en Familia.", goalNote: g => `Adaptado a tu objetivo: «${g}».`, familyEdit: "Editar familia", groupEdit: "Editar grupos", nickname: "Apodo", groupName: "Nombre del grupo (opcional)", members: "Miembros", add: "Añadir", edit: "Editar", remove: "Eliminar", close: "Cerrar", groupLimitTitle: "Límite de grupos", groupLimitBody: l => `Tu plan permite hasta ${l} grupo(s). Los planes superiores permiten más.`, seePlans: "Ver planes", groupCount: (n, l) => `Grupos ${n} / ${l}`, noMembers: "Registra primero a tu familia." },
  fr: { cardTitle: "Réglages d'objectif et de personne lue (par défaut)", cardIntro: "Traits, lecture du jour et consultation suivent l'objectif et la personne choisis jusqu'à modification.", goalLabel: "Objectif actuel", goalPlaceholder: "Ex. : tenter un nouveau travail d'ici l'automne", presets: { work: "Travail", love: "Amour", family: "Famille", health: "Santé", money: "Argent", growth: "Évolution" }, targetLabel: "Personne principale", self: "Moi", family: "Famille", group: "Groupe", choosePerson: "Choisir une personne", chooseGroup: "Choisir un groupe", none: "Aucun enregistrement. Ajoutez-en dans l'onglet Famille.", save: "Enregistrer", saved: "Objectif et personne enregistrés", groupWord: "Groupe ", traitsSelf: "Vos traits et lecture personnelle", traitsPerson: n => `Traits et lecture de ${n}`, traitsGroup: n => `Traits et lecture du groupe ${n}`, viewing: n => `Lecture de : ${n}`, backToSelf: "Revenir à moi", artOwnerOnly: "L'art familial et de groupe se débloque avec l'offre Famille", artOwnerOnlyBody: "Avec l'offre Famille ou supérieure, le mandala des couleurs de naissance de vos proches et de tout le groupe, ainsi que la Genèse cosmique de chacun, sont débloqués. Votre propre œuvre est affichée pour l'instant.", groupColor: "Couleur du groupe (harmonie globale)", groupMembers: "Membres et couleur principale", groupHarmony: "Harmonie du groupe", groupRhythm: "Rythme moyen du groupe aujourd'hui", groupEmpty: "Ce groupe n'a pas encore de membres. Ajoutez-les dans Famille.", goalNote: g => `Adapté à votre objectif : « ${g} ».`, familyEdit: "Modifier la famille", groupEdit: "Modifier les groupes", nickname: "Surnom", groupName: "Nom du groupe (facultatif)", members: "Membres", add: "Ajouter", edit: "Modifier", remove: "Supprimer", close: "Fermer", groupLimitTitle: "Limite de groupes atteinte", groupLimitBody: l => `Votre offre permet ${l} groupe(s). Les offres supérieures en permettent plus.`, seePlans: "Voir les offres", groupCount: (n, l) => `Groupes ${n} / ${l}`, noMembers: "Enregistrez d'abord votre famille." },
};

/** Goal sentence passed to AI prompts (preset label + free text). */
export function goalText(focus: Focus, language: Language) {
  const preset = goalPresets.find(p => p === focus.goalPreset);
  return [preset ? focusCopy[language].presets[preset] : "", focus.goal.trim()].filter(Boolean).join(" / ");
}
