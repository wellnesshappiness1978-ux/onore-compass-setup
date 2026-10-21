import type { Language } from './translations';

type EveningCopy = { headings: string[]; paragraphs: string[]; paces: string[]; goal: string; disclaimer: string };
export const eveningCopy: Record<Language, EveningCopy> = {
  "ja": {
    "headings": [
      "気持ちをほどく",
      "夜の浄化アクション",
      "明日の小さな準備",
      "星巡りの余韻"
    ],
    "paragraphs": [
      "{name}の{date}を、点数ではなく「何が心に残ったか」で振り返ってみましょう。嬉しかった場面、緊張した場面、まだ言葉にならない気持ちを一つずつ。感情の波を失敗と決めつけず、心が何を大切にしていたのかを見つける時間です。相手の期待と自分の希望を分けて書くと、今日の重さを明日まで持ち越す必要があるか、少し見えやすくなります。",
      "手を温かい水で洗い、机の上の物を一つだけ元の場所へ。これは体の毒素を取り除く方法ではなく、一日の終わりを感じる象徴的な区切りです。照明を落とし、肩の力を抜いて、苦しくない範囲でゆっくり息を吐きましょう。BGMを使うなら会話より小さな音量で、静けさが心地よければ音を止めても大丈夫です。夜まで頑張った自分に「今日はここまで」と声をかけてください。",
      "明日の参考リズムは{tomorrow}。{pace} 目標「{goal}」に向けて、最初の一歩だけを決めてみましょう。持ち物を一つ準備する、連絡文を一行下書きする、予定の間に休憩を入れる。その程度の小ささで十分です。今日できなかったことを全部取り戻そうとせず、明日の自分が迷わない入口を一つ作るのが、今夜の役目です。",
      "一年の{day}日目を通り過ぎた夜。遠くの星が急がず巡る様子を、眠る前の静かなイメージとして思い浮かべてみましょう。呼吸に合わせて今日の場面を遠くに置き、答えの出ない問題は紙に預けておく。眠りを努力の課題にせず、まず心地よい休息の時間を。眠れない夜が続くときは、専門家に相談することも自分を大切にする選択です。"
    ],
    "paces": [
      "明日は小さな挑戦を一つ、休憩と組み合わせる参考日に。",
      "明日は確認と余白を先に用意する参考日に。"
    ],
    "goal": "自分のペースを大切にする",
    "disclaimer": "リズム・星巡りは象徴的な参考情報です。浄化や睡眠改善の医学的効果を保証するものではありません。"
  },
  "en": {
    "headings": [
      "Unwind your feelings",
      "A calming evening ritual",
      "Prepare one step for tomorrow",
      "A quiet image of the stars"
    ],
    "paragraphs": [
      "Review {name}’s {date} through what stayed with you, rather than a score. Name one welcome moment, one tense moment and one feeling still waiting for words. A change in emotion is not a failure: it can show what mattered. Write your own hopes separately from other people’s expectations. Then decide which unfinished thought really needs to travel into tomorrow and which can rest here tonight.",
      "Wash your hands with comfortably warm water and return one object to its place. This is a symbolic end-of-day ritual, not physical detoxification. Dim the light, release your shoulders and breathe out gently without forcing a pattern. If you choose BGM, keep it quieter than conversation; silence is equally welcome. Offer yourself a simple closing sentence: enough for today. A small boundary can be kinder than another task on your evening list.",
      "Tomorrow’s illustrative rhythm is {tomorrow}. {pace} For the goal “{goal}”, choose only the first step: prepare one item, draft a line of a message or leave a break between appointments. There is no need to recover every missed task tonight. Give tomorrow’s self a clear doorway, not a demanding schedule. Put the preparation somewhere visible, then let the rest wait until you have rested.",
      "As day {day} of the year closes, picture distant stars moving without hurry. This is bedtime imagery, not a measured sleep intervention. With a comfortable breath, place today’s scenes a little farther away and leave unresolved questions on paper. Rest need not be another performance. If persistent sleep difficulties trouble you, seeking qualified support is also a way to care for yourself."
    ],
    "paces": [
      "Use tomorrow as a reference for one modest experiment with a break.",
      "Use tomorrow as a reference for checking details and leaving space."
    ],
    "goal": "respecting your own pace",
    "disclaimer": "Rhythms and star imagery are symbolic references, not guaranteed detoxification, healing or improved sleep."
  },
  "zh-CN": {
    "headings": [
      "梳理心绪",
      "夜间安顿仪式",
      "为明天准备一步",
      "星空的静谧余韵"
    ],
    "paragraphs": [
      "回顾{name}的{date}，先不评分，只问哪些画面留在心里。写下一件开心的事、一刻紧张和一种还说不清的感受。情绪起伏不等于失败，它也提醒你什么值得珍惜。把别人的期待和自己的希望分开记录，再看看哪件未完的事需要留到明天，哪份重担今晚可以先放下。",
      "用舒适的温水洗手，把桌上一件物品放回原位。这是象征一天结束的小仪式，并非排除身体毒素的方法。调暗灯光，放松肩膀，自然缓缓呼气，不勉强控制节奏。若播放BGM，让音量低于说话声；安静让你更舒服时也可以停止音乐。轻轻对自己说：今天到这里就好。",
      "明天的参考节律为{tomorrow}。{pace} 朝着目标「{goal}」，只准备第一步：整理一件随身物品、写一行消息草稿，或在安排之间留出休息。今晚不用补上所有未完成的任务。为明天的自己留一个容易开始的入口，而不是一张苛刻的清单，准备好后就安心休息。",
      "一年中的第{day}天即将结束。想象远方星星不慌不忙地移动，将它作为睡前安静的画面，而非睡眠治疗。伴随舒适的呼吸，把今天的片段轻轻放远，将暂时无解的问题交给纸笔。休息不必成为新的考核。若持续睡不好，向专业人士寻求支持，也是照顾自己的选择。"
    ],
    "paces": [
      "明天可参考小步尝试，并配合休息。",
      "明天可先核对细节，留出余地。"
    ],
    "goal": "尊重自己的节奏",
    "disclaimer": "节律与星空为象征性参考，不保证医学上的排毒、疗愈或睡眠改善。"
  },
  "zh-TW": {
    "headings": [
      "梳理心緒",
      "夜間安頓儀式",
      "為明天準備一步",
      "星空的靜謐餘韻"
    ],
    "paragraphs": [
      "回顧{name}的{date}，先不評分，只問哪些畫面留在心裡。寫下一件開心的事、一刻緊張和一種還說不清的感受。情緒起伏不等於失敗，也提醒你什麼值得珍惜。把別人的期待和自己的希望分開記錄，再看看哪件未完的事需要留到明天，哪份重擔今晚可以先放下。",
      "用舒適的溫水洗手，把桌上一件物品放回原位。這是象徵一天結束的小儀式，並非排除身體毒素的方法。調暗燈光，放鬆肩膀，自然緩緩呼氣，不勉強控制節奏。若播放BGM，讓音量低於說話聲；安靜讓你更舒服時也可以停止音樂。輕輕對自己說：今天到這裡就好。",
      "明天的參考節律為{tomorrow}。{pace} 朝著目標「{goal}」，只準備第一步：整理一件隨身物品、寫一行訊息草稿，或在安排之間留出休息。今晚不用補上所有未完成的任務。為明天的自己留一個容易開始的入口，而不是一張苛刻的清單，準備好後就安心休息。",
      "一年中的第{day}天即將結束。想像遠方星星不慌不忙地移動，將它作為睡前安靜的畫面，而非睡眠治療。伴隨舒適的呼吸，把今天的片段輕輕放遠，將暫時無解的問題交給紙筆。休息不必成為新的考核。若持續睡不好，向專業人士尋求支持，也是照顧自己的選擇。"
    ],
    "paces": [
      "明天可參考小步嘗試，並配合休息。",
      "明天可先核對細節，留出餘地。"
    ],
    "goal": "尊重自己的節奏",
    "disclaimer": "節律與星空為象徵性參考，不保證醫學上的排毒、療癒或睡眠改善。"
  },
  "ko": {
    "headings": [
      "감정 풀어보기",
      "저녁 정돈 의식",
      "내일의 한 걸음 준비",
      "별의 조용한 여운"
    ],
    "paragraphs": [
      "{name}의 {date}를 점수보다 마음에 남은 장면으로 돌아보세요. 기뻤던 순간, 긴장했던 순간, 아직 말이 되지 않은 감정을 하나씩 적어보세요. 감정의 변화는 실패가 아니라 소중한 것을 알려주는 단서일 수 있습니다. 다른 사람의 기대와 자신의 바람을 따로 적고, 어떤 생각을 내일로 가져갈지, 어떤 무게를 오늘 내려놓을지 살펴보세요.",
      "편안한 온수로 손을 씻고 책상 위 물건 하나를 제자리에 놓아보세요. 하루의 끝을 느끼는 상징적 의식이며 몸의 독소를 제거하는 방법은 아닙니다. 조명을 낮추고 어깨를 풀며 무리 없이 숨을 천천히 내쉬세요. BGM은 대화보다 작은 음량으로, 조용함이 더 좋다면 꺼도 괜찮습니다. 오늘은 여기까지라고 자신에게 말해주세요.",
      "내일의 참고 리듬은 {tomorrow}입니다. {pace} 목표 “{goal}”를 위해 첫 단계만 준비하세요. 물건 하나 챙기기, 메시지 한 줄 초안 쓰기, 일정 사이 휴식 넣기 정도면 충분합니다. 오늘 못한 일을 모두 되찾으려 하지 말고 내일의 자신이 쉽게 시작할 입구 하나를 만들어주세요. 준비를 눈에 보이는 곳에 두고 나머지는 쉰 뒤 생각해도 됩니다.",
      "올해의 {day}번째 날이 저물고 있습니다. 멀리서 서두르지 않고 움직이는 별을 잠들기 전 조용한 이미지로 떠올려보세요. 수면 치료가 아닌 상상입니다. 편한 호흡과 함께 오늘의 장면을 조금 멀리 놓고 미해결 문제는 종이에 맡겨두세요. 휴식을 또 다른 과제로 만들 필요는 없습니다. 수면 문제가 계속된다면 전문가의 도움을 받는 것도 자신을 돌보는 선택입니다."
    ],
    "paces": [
      "작은 시도 하나와 휴식을 함께 준비할 참고일입니다.",
      "확인과 여유를 먼저 마련할 참고일입니다."
    ],
    "goal": "자신의 속도 존중하기",
    "disclaimer": "리듬과 별 이미지는 상징적 참고이며 해독·치유·수면 개선 효과를 보장하지 않습니다."
  },
  "es": {
    "headings": [
      "Soltar las emociones",
      "Un ritual tranquilo",
      "Un paso para mañana",
      "La calma de las estrellas"
    ],
    "paragraphs": [
      "Repasa el {date} de {name} por lo que quedó en la memoria, no por una nota. Nombra un momento agradable, uno tenso y una emoción aún sin palabras. Cambiar de ánimo no es fallar: puede mostrar lo que importaba. Separa tus deseos de las expectativas ajenas en el papel. Decide qué pensamiento necesita seguir mañana y qué peso puede descansar aquí esta noche.",
      "Lava las manos con agua cómodamente tibia y devuelve un objeto a su lugar. Es un cierre simbólico del día, no una eliminación de toxinas físicas. Baja la luz, relaja los hombros y exhala suavemente sin forzar. Si eliges BGM, úsala a menos volumen que una conversación; el silencio también vale. Dite: por hoy es suficiente. Un límite pequeño puede ser más amable que otra tarea nocturna.",
      "El ritmo orientativo de mañana es {tomorrow}. {pace} Para la meta «{goal}», prepara solo el primer paso: un objeto, una línea de un mensaje o una pausa entre citas. No hace falta recuperar esta noche todas las tareas pendientes. Deja una entrada sencilla para tu yo de mañana, no un horario exigente. Coloca la preparación a la vista y permite que el resto espere al descanso.",
      "Al cerrar el día {day} del año, imagina estrellas lejanas moviéndose sin prisa. Es una imagen para el descanso, no un tratamiento del sueño. Con una respiración cómoda, aleja un poco las escenas del día y deja las preguntas pendientes en papel. Descansar no tiene que ser otro examen. Si los problemas de sueño persisten, buscar apoyo profesional también es cuidarte."
    ],
    "paces": [
      "Toma mañana como referencia para un pequeño ensayo con descanso.",
      "Toma mañana como referencia para revisar detalles y dejar margen."
    ],
    "goal": "respetar tu propio ritmo",
    "disclaimer": "Los ritmos y las estrellas son referencias simbólicas, sin garantía de desintoxicación, curación ni mejora del sueño."
  },
  "fr": {
    "headings": [
      "Accueillir les émotions",
      "Un rituel apaisant",
      "Un pas pour demain",
      "Le calme des étoiles"
    ],
    "paragraphs": [
      "Revenez sur le {date} de {name} par ce qui reste en mémoire, plutôt que par une note. Nommez un moment agréable, un moment tendu et une émotion encore sans mots. Une variation d’humeur n’est pas un échec : elle peut révéler ce qui compte. Séparez vos souhaits des attentes des autres sur le papier. Choisissez quelle pensée doit vous suivre demain et quel poids peut se reposer ici ce soir.",
      "Lavez vos mains avec une eau agréablement tiède et remettez un objet à sa place. C’est une fin de journée symbolique, pas une élimination physique de toxines. Baissez la lumière, relâchez les épaules et expirez doucement sans forcer. Si vous choisissez la BGM, gardez un volume inférieur à une conversation ; le silence convient aussi. Dites-vous : cela suffit pour aujourd’hui. Une petite limite peut être plus douce qu’une tâche de plus.",
      "Le rythme indicatif de demain est {tomorrow}. {pace} Pour l’objectif « {goal} », préparez seulement le premier pas : un objet, une ligne de message ou une pause entre rendez-vous. Inutile de rattraper tout ce soir. Offrez une entrée simple à votre moi de demain, plutôt qu’un programme exigeant. Posez la préparation à un endroit visible et laissez le reste attendre le repos.",
      "Au terme du jour {day} de l’année, imaginez des étoiles lointaines avançant sans hâte. C’est une image pour le coucher, pas un traitement du sommeil. Avec une respiration confortable, éloignez doucement les scènes du jour et confiez les questions ouvertes au papier. Le repos n’est pas une nouvelle performance. Si les difficultés de sommeil persistent, un soutien professionnel est aussi une manière de prendre soin de vous."
    ],
    "paces": [
      "Prenez demain comme repère pour un petit essai accompagné d’une pause.",
      "Prenez demain comme repère pour vérifier et garder de la marge."
    ],
    "goal": "respecter votre rythme",
    "disclaimer": "Rythmes et étoiles sont des références symboliques, sans garantie de détoxification, guérison ou amélioration du sommeil."
  }
};
export function eveningReading(language: Language, values: { name: string; date: string; tomorrow: number; day: number; goal: string }) {
 const t = eveningCopy[language];
 const data = { ...values, goal: values.goal || t.goal, pace: t.paces[values.tomorrow >= 55 ? 0 : 1] };
 return t.paragraphs.map((p, i) => ({ title: t.headings[i], body: p.replace(/\{(name|date|tomorrow|day|goal|pace)\}/g, (_, key: keyof typeof data) => String(data[key])) }));
}
