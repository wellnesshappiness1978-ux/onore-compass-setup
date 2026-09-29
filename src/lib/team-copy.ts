import type { Language } from "./translations";
import type { Plan } from "./design-modes";
import type { Element, Purpose, TeamRole } from "./team-analysis";

export type TeamCopy = {
  title: string; note: string; planNames: Record<Plan, string>; limit: (used: number, max: number) => string;
  tabs: [string, string, string, string, string, string, string];
  add: string; name: string; birthDate: string; jobRole: string; skills: string; skillsHint: string; save: string; remove: string; empty: string; guestNote: string;
  limitTitle: string; limitBody: (plan: string, max: number) => string; switchPlan: string; later: string;
  locked: (plan: string) => string; seePlans: string;
  select: string; selectedOf: (n: number, max: number) => string; balance: string; synergy: string; conflict: string; axisX: [string, string]; axisY: [string, string]; pickTwo: string;
  goal: string; goalPh: string; headcount: string; auto: string; runDraft: string; reevaluate: string; features: string; evaluation: string; cautions: string; recommended: (n: number) => string; swapHint: string;
  filterAll: string; search: string; thinking: string; words: string; bio: string;
  purpose: string; purposes: Record<Purpose, string>; best: string; caution: string; addGoogle: string; addApple: string; dayAdvice: string; advice: { good: string; mid: string; bad: string };
  missing: string; excess: string; none: string; target: string; elements: string; elementNames: Record<Element, string>;
  generate: string; praise: string; ng: string; low: string;
  roles: Record<TeamRole, string>; roleDesc: Record<TeamRole, string>; roleWords: Record<TeamRole, string>;
  priority: string; aiError: string; generating: string;
};

const ja: TeamCopy = {
  title: "チーム・組織コンサル", note: "開発テスト表示です。課金は未実装で、スコアは生年月日からの参考値です（正式な15占術鑑定ではありません）。",
  planNames: { free: "無料", standard: "スタンダード", vip: "VIP", b2b: "ビジネス", "b2b-premium": "ビジネスプレミアム" },
  limit: (u, m) => `登録 ${u} / ${m}人`,
  tabs: ["関係者名簿", "チーム同時診断", "AI人員選抜", "タレント名簿", "アラートカレンダー", "組織バランス", "1on1トリセツ"],
  add: "関係者を追加", name: "名前", birthDate: "生年月日", jobRole: "得意職種・役職", skills: "スキル", skillsHint: "カンマ区切り", save: "追加する", remove: "削除", empty: "まだ関係者が登録されていません。", guestNote: "未ログインのため、この端末内だけに保存されます。",
  limitTitle: "登録上限に達しました", limitBody: (p, m) => `この人数を登録するには${p}プラン（上限${m}人）への切り替えが必要です。`, switchPlan: "プランを切り替える", later: "あとで",
  locked: (p) => `この機能は${p}プラン以上で解放されます。`, seePlans: "プランを見る",
  select: "診断するメンバーを選択", selectedOf: (n, m) => `${n} / ${m}人選択中`, balance: "総合相性・バランス", synergy: "シナジー", conflict: "注意すべき衝突ポイント", axisX: ["論理", "共感"], axisY: ["計画", "行動"], pickTwo: "2人以上選ぶと診断できます。",
  goal: "企画・イベントの目的", goalPh: "例：新商品のローンチイベントを成功させたい", headcount: "希望人数", auto: "AIにおまかせ", runDraft: "AIで選抜する", reevaluate: "この組み合わせで再評価", features: "組み合わせの特徴", evaluation: "評価", cautions: "注意点", recommended: (n) => `推奨人数：${n}人`, swapHint: "チェックで手動差し替えできます",
  filterAll: "すべてのタイプ", search: "名前・スキルで検索", thinking: "思考パターン", words: "響く言葉", bio: "今日のバイオリズム",
  purpose: "目的", purposes: { negotiation: "商談", contract: "契約締結", interview: "採用面接", oneOnOne: "1on1面談" }, best: "最適日", caution: "注意日", addGoogle: "Googleカレンダー", addApple: "Appleカレンダー", dayAdvice: "日別攻略アドバイス",
  advice: { good: "流れに乗りやすい日。大事な提案や決断を前向きに進めましょう。", mid: "落ち着いて準備を整える日。確認と下調べを丁寧に。", bad: "無理に決めず、相手の話を聞くことを優先しましょう。" },
  missing: "不在のタイプ", excess: "多すぎるタイプ", none: "大きな偏りはありません", target: "次に採用したいターゲット像", elements: "五行バランス", elementNames: { wood: "木", fire: "火", earth: "土", metal: "金", water: "水" },
  generate: "トリセツを生成", praise: "最もやる気が出る褒め方", ng: "やってはいけないNG指示", low: "モチベーション低下時の対処法",
  roles: { leader: "リーダー", coordinator: "調整役", mood: "ムードメーカー", checker: "チェック役", ideator: "アイデアマン", strategist: "参謀", executor: "実行部隊" },
  roleDesc: { leader: "方向を示し、決断で場を前に進める", coordinator: "人と人をつなぎ、合意をつくる", mood: "空気を明るくし、巻き込む", checker: "細部を確かめ、品質を守る", ideator: "新しい発想を次々に生む", strategist: "全体を読み、筋道を設計する", executor: "決まったことを着実に形にする" },
  roleWords: { leader: "「あなたの決断力を信頼しています」", coordinator: "「あなたのおかげで、みんなの心が一つになりました」", mood: "「あなたがいると、場が明るくなります」", checker: "「細やかな気づきに、いつも助けられています」", ideator: "「その発想は新しい可能性を開いてくれます」", strategist: "「先を見通す視点が、とても頼もしいです」", executor: "「最後まで形にする力に、心から感謝しています」" },
  priority: "AI回答の優先生成（表示テスト）", aiError: "AIの生成に失敗しました。時間をおいて再度お試しください。", generating: "生成中…",
};

const en: TeamCopy = {
  title: "Team & Organization Consulting", note: "Development test view. Billing is not live; scores are reference values from birth dates, not a verified 15-arts reading.",
  planNames: { free: "Free", standard: "Standard", vip: "VIP", b2b: "Business", "b2b-premium": "Business Premium" },
  limit: (u, m) => `${u} / ${m} registered`,
  tabs: ["Members", "Team diagnosis", "AI draft", "Talent catalog", "Alert calendar", "Org balance", "1on1 guide"],
  add: "Add member", name: "Name", birthDate: "Birth date", jobRole: "Specialty / role", skills: "Skills", skillsHint: "comma separated", save: "Add", remove: "Remove", empty: "No members registered yet.", guestNote: "Not signed in — saved on this device only.",
  limitTitle: "Member limit reached", limitBody: (p, m) => `To register this many people, switch to the ${p} plan (up to ${m}).`, switchPlan: "Switch plan", later: "Not now",
  locked: (p) => `Unlocked from the ${p} plan.`, seePlans: "View plans",
  select: "Select members to diagnose", selectedOf: (n, m) => `${n} / ${m} selected`, balance: "Overall compatibility & balance", synergy: "Synergies", conflict: "Potential friction points", axisX: ["Logic", "Empathy"], axisY: ["Plan", "Action"], pickTwo: "Select two or more people.",
  goal: "Project / event goal", goalPh: "e.g. Make our product launch event a success", headcount: "Headcount", auto: "Let AI decide", runDraft: "Draft with AI", reevaluate: "Re-evaluate this lineup", features: "Team character", evaluation: "Evaluation", cautions: "Watch points", recommended: (n) => `Recommended size: ${n}`, swapHint: "Tick boxes to swap members manually",
  filterAll: "All types", search: "Search name or skill", thinking: "Thinking pattern", words: "Words that resonate", bio: "Today's biorhythm",
  purpose: "Purpose", purposes: { negotiation: "Sales meeting", contract: "Contract signing", interview: "Hiring interview", oneOnOne: "1on1" }, best: "Best day", caution: "Caution day", addGoogle: "Google Calendar", addApple: "Apple Calendar", dayAdvice: "Daily tips",
  advice: { good: "Good flow. Move important proposals and decisions forward.", mid: "A day to prepare calmly. Double-check and research.", bad: "Avoid forcing decisions; prioritize listening." },
  missing: "Missing types", excess: "Over-represented types", none: "No major imbalance", target: "Next hiring target", elements: "Five-element balance", elementNames: { wood: "Wood", fire: "Fire", earth: "Earth", metal: "Metal", water: "Water" },
  generate: "Generate guide", praise: "Praise that motivates most", ng: "Instructions to avoid", low: "When motivation dips",
  roles: { leader: "Leader", coordinator: "Coordinator", mood: "Mood maker", checker: "Checker", ideator: "Idea person", strategist: "Strategist", executor: "Executor" },
  roleDesc: { leader: "Sets direction and moves things forward", coordinator: "Connects people and builds consensus", mood: "Lifts the atmosphere and involves others", checker: "Checks details and protects quality", ideator: "Generates fresh ideas", strategist: "Reads the whole and designs the path", executor: "Steadily turns decisions into results" },
  roleWords: { leader: "“I want you to lead this.”", coordinator: "“You brought us together.”", mood: "“It's fun working with you.”", checker: "“Your care saved us.”", ideator: "“Love that idea.”", strategist: "“Sharp read.”", executor: "“Thanks for seeing it through.”" },
  priority: "Priority AI (label only)", aiError: "AI generation failed. Please try again later.", generating: "Generating…",
};

const mk = (base: TeamCopy, o: Partial<TeamCopy>): TeamCopy => ({ ...base, ...o });

const zhCN = mk(en, {
  title: "团队・组织咨询", note: "开发测试显示。尚未启用付费；分数为基于出生日期的参考值，并非正式的15占术鉴定。",
  planNames: { free: "免费", standard: "标准", vip: "VIP", b2b: "企业", "b2b-premium": "企业尊享" }, limit: (u, m) => `已登记 ${u} / ${m}人`,
  tabs: ["相关人员", "团队同时诊断", "AI人员选拔", "人才名册", "提醒日历", "组织平衡", "1on1指南"],
  add: "添加人员", name: "姓名", birthDate: "出生日期", jobRole: "擅长职种・职位", skills: "技能", skillsHint: "用逗号分隔", save: "添加", remove: "删除", empty: "尚未登记人员。", guestNote: "未登录，仅保存在本设备。",
  limitTitle: "已达登记上限", limitBody: (p, m) => `登记这么多人需要切换到${p}方案（上限${m}人）。`, switchPlan: "切换方案", later: "以后再说", locked: (p) => `此功能从${p}方案起开放。`, seePlans: "查看方案",
  select: "选择诊断成员", selectedOf: (n, m) => `已选 ${n} / ${m}人`, balance: "综合相性・平衡", synergy: "协同", conflict: "需注意的冲突点", axisX: ["逻辑", "共情"], axisY: ["计划", "行动"], pickTwo: "请选择2人以上。",
  goal: "企划・活动目的", goalPh: "例：让新品发布会取得成功", headcount: "希望人数", auto: "交给AI", runDraft: "AI选拔", reevaluate: "按此组合重新评估", features: "组合特点", evaluation: "评价", cautions: "注意事项", recommended: (n) => `推荐人数：${n}人`, swapHint: "勾选可手动替换",
  filterAll: "全部类型", search: "按姓名・技能搜索", thinking: "思维模式", words: "打动人心的话", bio: "今日生物节律",
  purpose: "目的", purposes: { negotiation: "商谈", contract: "签约", interview: "招聘面试", oneOnOne: "1on1面谈" }, best: "最佳日", caution: "注意日", dayAdvice: "每日攻略建议",
  advice: { good: "顺势之日，积极推进重要提案与决定。", mid: "沉稳准备之日，仔细确认与调研。", bad: "不要勉强决定，优先倾听对方。" },
  missing: "缺少的类型", excess: "过多的类型", none: "没有明显偏差", target: "下一位招聘目标", elements: "五行平衡", elementNames: { wood: "木", fire: "火", earth: "土", metal: "金", water: "水" },
  generate: "生成指南", praise: "最能激励的表扬方式", ng: "绝对不要的指示", low: "动力下降时的应对",
  roles: { leader: "领导者", coordinator: "协调者", mood: "气氛担当", checker: "把关者", ideator: "点子王", strategist: "参谋", executor: "执行者" },
  roleDesc: { leader: "指明方向，推动前进", coordinator: "连接人与人，达成共识", mood: "活跃气氛，带动大家", checker: "检查细节，守护品质", ideator: "不断产生新想法", strategist: "纵观全局，设计路线", executor: "稳步把决定落实" },
  priority: "优先AI生成（仅显示）", aiError: "AI生成失败，请稍后再试。", generating: "生成中…",
});
const zhTW = mk(zhCN, {
  title: "團隊・組織諮詢", note: "開發測試顯示。尚未啟用付費；分數為依出生日期計算的參考值，並非正式的15占術鑑定。",
  planNames: { free: "免費", standard: "標準", vip: "VIP", b2b: "企業", "b2b-premium": "企業尊享" }, limit: (u, m) => `已登錄 ${u} / ${m}人`,
  tabs: ["相關人員", "團隊同時診斷", "AI人員選拔", "人才名冊", "提醒日曆", "組織平衡", "1on1指南"],
  add: "新增人員", name: "姓名", birthDate: "出生日期", jobRole: "擅長職種・職位", skills: "技能", skillsHint: "以逗號分隔", save: "新增", remove: "刪除", empty: "尚未登錄人員。", guestNote: "未登入，僅儲存在本裝置。",
  limitTitle: "已達登錄上限", limitBody: (p, m) => `登錄這麼多人需要切換到${p}方案（上限${m}人）。`, switchPlan: "切換方案", later: "稍後", locked: (p) => `此功能自${p}方案起開放。`, seePlans: "查看方案",
  select: "選擇診斷成員", selectedOf: (n, m) => `已選 ${n} / ${m}人`, balance: "綜合相性・平衡", synergy: "協同", conflict: "需注意的衝突點", axisX: ["邏輯", "共感"], axisY: ["計畫", "行動"], pickTwo: "請選擇2人以上。",
  goal: "企劃・活動目的", goalPh: "例：讓新品發表會成功", headcount: "希望人數", auto: "交給AI", runDraft: "AI選拔", reevaluate: "以此組合重新評估", features: "組合特色", evaluation: "評價", cautions: "注意事項", recommended: (n) => `建議人數：${n}人`, swapHint: "勾選可手動替換",
  filterAll: "全部類型", search: "以姓名・技能搜尋", thinking: "思考模式", words: "打動人心的話", bio: "今日生物節律",
  purposes: { negotiation: "商談", contract: "簽約", interview: "招募面試", oneOnOne: "1on1面談" }, best: "最佳日", caution: "注意日", dayAdvice: "每日攻略建議",
  advice: { good: "順勢之日，積極推進重要提案與決定。", mid: "沉穩準備之日，仔細確認與調查。", bad: "不要勉強決定，優先傾聽對方。" },
  missing: "缺少的類型", excess: "過多的類型", none: "沒有明顯偏差", target: "下一位招募目標", elements: "五行平衡",
  generate: "產生指南", praise: "最能激勵的稱讚方式", ng: "絕對不要的指示", low: "動力下降時的對策",
  roles: { leader: "領導者", coordinator: "協調者", mood: "氣氛擔當", checker: "把關者", ideator: "點子王", strategist: "參謀", executor: "執行者" },
  roleDesc: { leader: "指引方向，推動前進", coordinator: "連結人與人，形成共識", mood: "活絡氣氛，帶動大家", checker: "檢查細節，守護品質", ideator: "不斷產生新點子", strategist: "綜觀全局，設計路線", executor: "穩健落實決定" },
  priority: "優先AI生成（僅顯示）", aiError: "AI產生失敗，請稍後再試。", generating: "產生中…",
});
const ko = mk(en, {
  title: "팀・조직 컨설팅", note: "개발 테스트 화면입니다. 결제는 미구현이며 점수는 생년월일 기반 참고값입니다(정식 15점술 감정 아님).",
  planNames: { free: "무료", standard: "스탠다드", vip: "VIP", b2b: "비즈니스", "b2b-premium": "비즈니스 프리미엄" }, limit: (u, m) => `등록 ${u} / ${m}명`,
  tabs: ["관계자 명단", "팀 동시 진단", "AI 인원 선발", "탤런트 명부", "알림 캘린더", "조직 밸런스", "1on1 가이드"],
  add: "관계자 추가", name: "이름", birthDate: "생년월일", jobRole: "전문 직종・직책", skills: "스킬", skillsHint: "쉼표로 구분", save: "추가", remove: "삭제", empty: "아직 등록된 관계자가 없습니다.", guestNote: "로그인하지 않아 이 기기에만 저장됩니다.",
  limitTitle: "등록 한도에 도달했습니다", limitBody: (p, m) => `이 인원을 등록하려면 ${p} 플랜(최대 ${m}명)으로 전환해야 합니다.`, switchPlan: "플랜 전환", later: "나중에", locked: (p) => `${p} 플랜부터 이용할 수 있습니다.`, seePlans: "플랜 보기",
  select: "진단할 멤버 선택", selectedOf: (n, m) => `${n} / ${m}명 선택`, balance: "종합 궁합・밸런스", synergy: "시너지", conflict: "주의할 충돌 포인트", axisX: ["논리", "공감"], axisY: ["계획", "행동"], pickTwo: "2명 이상 선택하세요.",
  goal: "기획・이벤트 목적", goalPh: "예: 신제품 론칭 이벤트 성공", headcount: "희망 인원", auto: "AI에게 맡기기", runDraft: "AI로 선발", reevaluate: "이 조합으로 재평가", features: "조합 특징", evaluation: "평가", cautions: "주의점", recommended: (n) => `추천 인원: ${n}명`, swapHint: "체크로 수동 교체 가능",
  filterAll: "모든 유형", search: "이름・스킬 검색", thinking: "사고 패턴", words: "마음에 닿는 말", bio: "오늘의 바이오리듬",
  purpose: "목적", purposes: { negotiation: "상담", contract: "계약 체결", interview: "채용 면접", oneOnOne: "1on1 면담" }, best: "최적일", caution: "주의일", dayAdvice: "일별 공략 조언",
  advice: { good: "흐름을 타기 쉬운 날. 중요한 제안과 결정을 진행하세요.", mid: "차분히 준비하는 날. 확인과 조사를 꼼꼼히.", bad: "무리하게 결정하지 말고 경청을 우선하세요." },
  missing: "부재 유형", excess: "과다 유형", none: "큰 치우침 없음", target: "다음 채용 타깃", elements: "오행 밸런스", elementNames: { wood: "목", fire: "화", earth: "토", metal: "금", water: "수" },
  generate: "가이드 생성", praise: "가장 의욕이 나는 칭찬", ng: "하면 안 되는 지시", low: "의욕 저하 시 대처법",
  roles: { leader: "리더", coordinator: "조정자", mood: "분위기 메이커", checker: "체크 담당", ideator: "아이디어맨", strategist: "참모", executor: "실행 부대" },
  roleDesc: { leader: "방향을 제시하고 앞으로 이끈다", coordinator: "사람을 잇고 합의를 만든다", mood: "분위기를 밝히고 끌어들인다", checker: "세부를 확인하고 품질을 지킨다", ideator: "새 발상을 계속 만든다", strategist: "전체를 읽고 길을 설계한다", executor: "정해진 일을 착실히 실현한다" },
  priority: "우선 AI 생성(표시만)", aiError: "AI 생성에 실패했습니다. 잠시 후 다시 시도하세요.", generating: "생성 중…",
});
const es = mk(en, {
  title: "Consultoría de equipos y organización", note: "Vista de prueba. Sin cobro real; las puntuaciones son valores de referencia por fecha de nacimiento, no una lectura verificada.",
  planNames: { free: "Gratis", standard: "Estándar", vip: "VIP", b2b: "Empresa", "b2b-premium": "Empresa Premium" }, limit: (u, m) => `${u} / ${m} registrados`,
  tabs: ["Miembros", "Diagnóstico de equipo", "Selección IA", "Catálogo de talento", "Calendario de alertas", "Balance organizativo", "Guía 1on1"],
  add: "Añadir miembro", name: "Nombre", birthDate: "Fecha de nacimiento", jobRole: "Especialidad / cargo", skills: "Habilidades", skillsHint: "separadas por comas", save: "Añadir", remove: "Quitar", empty: "Aún no hay miembros.", guestNote: "Sin sesión: se guarda solo en este dispositivo.",
  limitTitle: "Límite alcanzado", limitBody: (p, m) => `Para registrar a tantas personas, cambia al plan ${p} (hasta ${m}).`, switchPlan: "Cambiar plan", later: "Ahora no", locked: (p) => `Disponible desde el plan ${p}.`, seePlans: "Ver planes",
  select: "Selecciona miembros", selectedOf: (n, m) => `${n} / ${m} seleccionados`, balance: "Compatibilidad y balance", synergy: "Sinergias", conflict: "Posibles fricciones", axisX: ["Lógica", "Empatía"], axisY: ["Plan", "Acción"], pickTwo: "Selecciona dos o más personas.",
  goal: "Objetivo del proyecto", goalPh: "p. ej. Lograr un lanzamiento exitoso", headcount: "Número de personas", auto: "Que decida la IA", runDraft: "Seleccionar con IA", reevaluate: "Reevaluar esta combinación", features: "Carácter del equipo", evaluation: "Evaluación", cautions: "Puntos de atención", recommended: (n) => `Tamaño recomendado: ${n}`, swapHint: "Marca casillas para cambiar miembros",
  filterAll: "Todos los tipos", search: "Buscar nombre o habilidad", thinking: "Patrón de pensamiento", words: "Palabras que resuenan", bio: "Biorritmo de hoy",
  purpose: "Propósito", purposes: { negotiation: "Reunión comercial", contract: "Firma de contrato", interview: "Entrevista", oneOnOne: "1on1" }, best: "Día óptimo", caution: "Día de cautela", dayAdvice: "Consejos del día",
  advice: { good: "Buen flujo: impulsa propuestas y decisiones.", mid: "Día para prepararte con calma.", bad: "No fuerces decisiones; prioriza escuchar." },
  missing: "Tipos ausentes", excess: "Tipos en exceso", none: "Sin desequilibrios notables", target: "Próximo perfil a contratar", elements: "Balance de cinco elementos", elementNames: { wood: "Madera", fire: "Fuego", earth: "Tierra", metal: "Metal", water: "Agua" },
  generate: "Generar guía", praise: "Elogios que más motivan", ng: "Instrucciones a evitar", low: "Si baja la motivación",
  roles: { leader: "Líder", coordinator: "Coordinador", mood: "Animador", checker: "Revisor", ideator: "Creativo", strategist: "Estratega", executor: "Ejecutor" },
  roleDesc: { leader: "Marca el rumbo y avanza", coordinator: "Conecta personas y logra consensos", mood: "Anima el ambiente", checker: "Cuida detalles y calidad", ideator: "Genera ideas nuevas", strategist: "Lee el conjunto y diseña el camino", executor: "Convierte decisiones en resultados" },
  priority: "IA prioritaria (solo etiqueta)", aiError: "Falló la generación con IA. Inténtalo más tarde.", generating: "Generando…",
});
const fr = mk(en, {
  title: "Conseil équipe & organisation", note: "Vue de test. Pas de facturation réelle ; les scores sont des valeurs de référence issues des dates de naissance, pas une lecture vérifiée.",
  planNames: { free: "Gratuit", standard: "Standard", vip: "VIP", b2b: "Entreprise", "b2b-premium": "Entreprise Premium" }, limit: (u, m) => `${u} / ${m} inscrits`,
  tabs: ["Membres", "Diagnostic d’équipe", "Sélection IA", "Catalogue talents", "Calendrier d’alertes", "Équilibre", "Guide 1on1"],
  add: "Ajouter un membre", name: "Nom", birthDate: "Date de naissance", jobRole: "Spécialité / poste", skills: "Compétences", skillsHint: "séparées par des virgules", save: "Ajouter", remove: "Retirer", empty: "Aucun membre pour l’instant.", guestNote: "Non connecté : enregistré sur cet appareil uniquement.",
  limitTitle: "Limite atteinte", limitBody: (p, m) => `Pour inscrire autant de personnes, passez à l’offre ${p} (jusqu’à ${m}).`, switchPlan: "Changer d’offre", later: "Plus tard", locked: (p) => `Disponible à partir de l’offre ${p}.`, seePlans: "Voir les offres",
  select: "Choisir les membres", selectedOf: (n, m) => `${n} / ${m} sélectionnés`, balance: "Compatibilité et équilibre", synergy: "Synergies", conflict: "Points de friction", axisX: ["Logique", "Empathie"], axisY: ["Plan", "Action"], pickTwo: "Choisissez au moins deux personnes.",
  goal: "Objectif du projet", goalPh: "ex. Réussir le lancement produit", headcount: "Effectif", auto: "Laisser l’IA choisir", runDraft: "Sélection IA", reevaluate: "Réévaluer cette équipe", features: "Caractère de l’équipe", evaluation: "Évaluation", cautions: "Points de vigilance", recommended: (n) => `Taille recommandée : ${n}`, swapHint: "Cochez pour remplacer manuellement",
  filterAll: "Tous les types", search: "Nom ou compétence", thinking: "Mode de pensée", words: "Mots qui touchent", bio: "Biorythme du jour",
  purpose: "Objet", purposes: { negotiation: "Rendez-vous commercial", contract: "Signature", interview: "Entretien", oneOnOne: "1on1" }, best: "Jour idéal", caution: "Jour prudent", dayAdvice: "Conseils du jour",
  advice: { good: "Bon élan : avancez propositions et décisions.", mid: "Jour de préparation calme.", bad: "Ne forcez pas ; privilégiez l’écoute." },
  missing: "Types absents", excess: "Types surreprésentés", none: "Pas de déséquilibre marqué", target: "Profil à recruter", elements: "Équilibre des cinq éléments", elementNames: { wood: "Bois", fire: "Feu", earth: "Terre", metal: "Métal", water: "Eau" },
  generate: "Générer le guide", praise: "Compliments les plus motivants", ng: "Consignes à éviter", low: "Quand la motivation baisse",
  roles: { leader: "Leader", coordinator: "Coordinateur", mood: "Animateur", checker: "Contrôleur", ideator: "Créatif", strategist: "Stratège", executor: "Exécutant" },
  roleDesc: { leader: "Donne le cap et fait avancer", coordinator: "Relie les gens et crée le consensus", mood: "Anime l’ambiance", checker: "Vérifie les détails et la qualité", ideator: "Génère des idées neuves", strategist: "Lit l’ensemble et trace la voie", executor: "Concrétise les décisions" },
  priority: "IA prioritaire (étiquette)", aiError: "Échec de la génération IA. Réessayez plus tard.", generating: "Génération…",
});

export const teamCopy: Record<Language, TeamCopy> = { ja, en, "zh-CN": zhCN, "zh-TW": zhTW, ko, es, fr };
