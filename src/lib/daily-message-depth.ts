import type { Language } from "./translations";

/** Deeper paragraphs appended to the daily subject message: meaning, concrete action, evening reflection. */
type Depth = { meaning: string[]; action: string[]; reflect: string[] };

export const dailyMessageDepth: Record<Language, Depth> = {
  ja: {
    meaning: [
      "今日の流れが映し出しているのは、心の奥でずっと温めてきた願いです。焦って形にしなくても、その願いを言葉にして自分で認めるだけで、内側の軸が静かに整い始めます。周りの声よりも、自分の小さな「こうしたい」を信じてよい日です。",
      "今日は、外に向かう力よりも内側を満たす力が強く働いています。疲れや迷いは弱さではなく、次へ進むための合図。立ち止まる時間を「遅れ」ではなく「準備」と受け取ると、驚くほど心が軽くなります。",
      "ずっと気になっていたことに、今日は自然と手が伸びるはずです。完璧を待たずに一歩目を踏み出すと、その小さな動きが周囲の反応を呼び、思いがけない後押しにつながります。迷いの多くは、動き出した瞬間にほどけていきます。",
      "人との関わりの中に、今日のいちばん大切な気づきが隠れています。相手の言葉の奥にある本当の気持ちに耳を澄ませると、これまで噛み合わなかった歯車がそっと動き出します。分かり合う努力は、必ず自分にも返ってきます。",
      "今日は「手放す」ことで運が通る日です。抱え込んだ予定、我慢している言葉、使っていない物。どれか一つを手放すと、空いた場所に新しい流れが入ってきます。軽くなることは、失うことではなく、受け取る準備です。",
      "これまで積み重ねてきたことが、静かに実を結び始めています。目に見える成果がまだ小さくても、根はしっかり育っています。今日は自分の歩みを振り返り、ここまで来た自分をきちんと認めてあげてください。",
    ],
    action: [
      "具体的には、朝のうちに今日いちばん大切なことを一行だけメモに書き、昼までに5分だけ手をつけてみてください。",
      "具体的には、昼休みに5分だけ外の空気を吸い、深呼吸を三回してから午後の予定を一つだけ見直してください。",
      "具体的には、身近な人に「ありがとう、助かったよ」と理由を添えて一言伝えてみてください。",
      "具体的には、夕方までに後回しにしている連絡を一通だけ送り、気がかりを一つ減らしてください。",
      "具体的には、机の上か鞄の中を10分だけ整え、使わない物を一つ手放してください。",
      "具体的には、寝る前にスマートフォンを置き、今日うまくいったことを三つ思い出してください。",
    ],
    reflect: [
      "夜には「今日、自分を大切にできた瞬間はどこだったか」を一つだけ振り返ってみましょう。",
      "一日の終わりに、心に残った出来事を一言で書き留めると、明日の流れがさらに澄んでいきます。",
      "眠る前に、今日出会った人の顔を一人思い浮かべ、心の中で感謝を送ってみてください。",
      "うまくいかなかったことがあっても、それは明日への道しるべ。責めずにそっと置いて眠りましょう。",
    ],
  },
  en: {
    meaning: [
      "Today's flow reflects a wish you have quietly carried for a long time. Simply naming it and acknowledging it to yourself begins to steady your inner axis — no rush to make it real yet.",
      "Today the energy that fills you from within is stronger than the push outward. Tiredness or doubt is a signal, not a weakness; treat a pause as preparation rather than delay.",
      "Something you have been circling will feel easier to start today. A small first step, taken before it is perfect, invites responses and unexpected support.",
      "Today's most important insight is hidden in your connections. Listening for the feeling behind someone's words can set long-stuck gears gently turning again.",
      "Today luck flows through letting go. Release one plan, unspoken burden or unused object, and new movement can fill the space you open.",
      "What you have built is quietly starting to bear fruit. Even if results look small, the roots are strong — take a moment to recognize how far you have come.",
    ],
    action: [
      "Concretely: write today's single most important thing in one line this morning and give it five minutes before noon.",
      "Concretely: step outside for five minutes at lunch, take three deep breaths, then review one afternoon task.",
      "Concretely: tell someone close \"thank you, that helped\" with one specific reason.",
      "Concretely: send one message you have been postponing before evening.",
      "Concretely: tidy your desk or bag for ten minutes and let go of one unused item.",
      "Concretely: put your phone down before bed and recall three things that went well.",
    ],
    reflect: [
      "Tonight, recall one moment when you truly took care of yourself.",
      "At day's end, jot down one word for what stayed with you; tomorrow's flow grows clearer.",
      "Before sleep, picture one person you met today and silently send them thanks.",
      "If something did not go well, treat it as a signpost for tomorrow and set it down gently.",
    ],
  },
  "zh-CN": {
    meaning: [
      "今天的流动映照出你内心长久珍藏的愿望。不必急着实现，只要把它说出来并认可自己，内在的轴心就会安静地稳定下来。",
      "今天向内充实的力量比向外的推动更强。疲惫与迷茫不是软弱，而是前进的信号；把停下来当作准备，而不是落后。",
      "一直在意的事情，今天会更容易开始。不等完美就迈出第一步，会引来回应与意想不到的支持。",
      "今天最重要的领悟藏在人际关系中。倾听对方话语背后的真实心情，久未契合的齿轮会悄然转动。",
      "今天通过“放下”让好运流动。放下一个计划、一句忍着的话或一件不用的物品，新的流动就会进入。",
      "一路积累的努力正在悄悄结果。即使成果尚小，根已扎稳——请认可走到这里的自己。",
    ],
    action: [
      "具体来说：早上用一行字写下今天最重要的事，中午前先投入五分钟。",
      "具体来说：午休时到户外五分钟，深呼吸三次，再检查一项下午的安排。",
      "具体来说：对身边的人说一句带理由的“谢谢，帮了大忙”。",
      "具体来说：傍晚前发出一条一直拖延的消息。",
      "具体来说：整理桌面或包十分钟，放下一件不用的物品。",
      "具体来说：睡前放下手机，回想三件顺利的事。",
    ],
    reflect: [
      "今晚回想一个真正善待自己的瞬间。",
      "一天结束时用一个词记下印象最深的事，明天会更清晰。",
      "睡前想起今天遇到的一个人，在心里送上感谢。",
      "即使有不顺，也把它当作明天的路标，轻轻放下再入睡。",
    ],
  },
  "zh-TW": {
    meaning: [
      "今天的流動映照出你內心長久珍藏的願望。不必急著實現，只要把它說出來並認可自己，內在的軸心就會安靜地穩定下來。",
      "今天向內充實的力量比向外的推動更強。疲憊與迷惘不是軟弱，而是前進的訊號；把停下來當作準備，而不是落後。",
      "一直在意的事情，今天會更容易開始。不等完美就踏出第一步，會引來回應與意想不到的支持。",
      "今天最重要的領悟藏在人際關係中。傾聽對方話語背後的真實心情，久未契合的齒輪會悄然轉動。",
      "今天透過「放下」讓好運流動。放下一個計畫、一句忍著的話或一件不用的物品，新的流動就會進入。",
      "一路累積的努力正在悄悄結果。即使成果尚小，根已紮穩——請認可走到這裡的自己。",
    ],
    action: [
      "具體來說：早上用一行字寫下今天最重要的事，中午前先投入五分鐘。",
      "具體來說：午休時到戶外五分鐘，深呼吸三次，再檢查一項下午的安排。",
      "具體來說：對身邊的人說一句帶理由的「謝謝，幫了大忙」。",
      "具體來說：傍晚前送出一則一直拖延的訊息。",
      "具體來說：整理桌面或包包十分鐘，放下一件不用的物品。",
      "具體來說：睡前放下手機，回想三件順利的事。",
    ],
    reflect: [
      "今晚回想一個真正善待自己的瞬間。",
      "一天結束時用一個詞記下印象最深的事，明天會更清晰。",
      "睡前想起今天遇到的一個人，在心裡送上感謝。",
      "即使有不順，也把它當作明天的路標，輕輕放下再入睡。",
    ],
  },
  ko: {
    meaning: [
      "오늘의 흐름은 마음속에 오래 품어 온 소망을 비춥니다. 서둘러 이루지 않아도, 말로 꺼내 스스로 인정하는 것만으로 내면의 축이 조용히 정돈됩니다.",
      "오늘은 밖으로 향하는 힘보다 안을 채우는 힘이 강합니다. 피로와 망설임은 약함이 아니라 신호이니, 멈춤을 늦음이 아닌 준비로 받아들이세요.",
      "계속 마음에 걸리던 일을 오늘은 시작하기 쉬워집니다. 완벽을 기다리지 않은 작은 첫걸음이 반응과 뜻밖의 도움을 부릅니다.",
      "오늘 가장 중요한 깨달음은 관계 속에 숨어 있습니다. 상대의 말 뒤 진짜 마음에 귀 기울이면 멈춰 있던 톱니가 다시 돌기 시작합니다.",
      "오늘은 내려놓음으로 운이 흐릅니다. 계획 하나, 참아 온 말 하나, 쓰지 않는 물건 하나를 놓으면 그 자리에 새 흐름이 들어옵니다.",
      "쌓아 온 노력이 조용히 열매를 맺기 시작했습니다. 결과가 아직 작아도 뿌리는 튼튼합니다. 여기까지 온 자신을 인정해 주세요.",
    ],
    action: [
      "구체적으로: 아침에 오늘 가장 중요한 일을 한 줄로 적고 정오 전에 5분만 손대 보세요.",
      "구체적으로: 점심에 5분 바깥 공기를 마시고 심호흡 세 번 후 오후 일정을 하나 점검하세요.",
      "구체적으로: 가까운 사람에게 이유를 담아 \"고마워, 도움이 됐어\"라고 전하세요.",
      "구체적으로: 저녁 전까지 미뤄 둔 연락을 한 통 보내세요.",
      "구체적으로: 책상이나 가방을 10분 정리하고 쓰지 않는 물건 하나를 내려놓으세요.",
      "구체적으로: 잠들기 전 휴대폰을 내려놓고 잘된 일 세 가지를 떠올리세요.",
    ],
    reflect: [
      "오늘 밤, 자신을 정말 아껴 준 순간을 하나 떠올려 보세요.",
      "하루 끝에 마음에 남은 일을 한 단어로 적으면 내일의 흐름이 더 맑아집니다.",
      "잠들기 전 오늘 만난 한 사람을 떠올리며 마음속으로 감사를 보내세요.",
      "잘 안 된 일이 있어도 내일의 이정표로 삼고 살며시 내려놓고 주무세요.",
    ],
  },
  es: {
    meaning: [
      "El flujo de hoy refleja un deseo que llevas tiempo guardando. Basta con nombrarlo y reconocerlo para que tu eje interior empiece a serenarse, sin prisa por cumplirlo.",
      "Hoy la energía que te llena por dentro es más fuerte que el impulso hacia fuera. El cansancio o la duda son señales, no debilidad; toma la pausa como preparación.",
      "Algo que venías rodeando será más fácil de empezar hoy. Un primer paso pequeño, antes de que sea perfecto, atrae respuestas y apoyos inesperados.",
      "La idea más importante de hoy se esconde en tus vínculos. Escuchar el sentimiento detrás de las palabras puede volver a mover engranajes atascados.",
      "Hoy la suerte fluye al soltar. Deja ir un plan, una carga callada o un objeto sin uso, y algo nuevo llenará ese espacio.",
      "Lo que has construido empieza a dar fruto en silencio. Aunque los resultados parezcan pequeños, las raíces son firmes: reconoce cuánto has avanzado.",
    ],
    action: [
      "En concreto: escribe por la mañana lo más importante del día en una línea y dedícale cinco minutos antes del mediodía.",
      "En concreto: sal cinco minutos al aire libre al mediodía, respira hondo tres veces y revisa una tarea de la tarde.",
      "En concreto: dile a alguien cercano \"gracias, me ayudó\" con un motivo concreto.",
      "En concreto: envía antes de la tarde un mensaje que venías posponiendo.",
      "En concreto: ordena tu mesa o bolso diez minutos y suelta un objeto sin uso.",
      "En concreto: deja el móvil antes de dormir y recuerda tres cosas que salieron bien.",
    ],
    reflect: [
      "Esta noche, recuerda un momento en que te cuidaste de verdad.",
      "Al terminar el día, anota una palabra sobre lo que te quedó; el mañana se aclarará.",
      "Antes de dormir, piensa en una persona de hoy y envíale gratitud en silencio.",
      "Si algo no salió bien, tómalo como señal para mañana y déjalo descansar.",
    ],
  },
  fr: {
    meaning: [
      "Le flux du jour reflète un souhait que vous portez depuis longtemps. Le nommer et le reconnaître suffit pour que votre axe intérieur se stabilise, sans hâte de le réaliser.",
      "Aujourd’hui, l’énergie qui vous nourrit de l’intérieur dépasse l’élan vers l’extérieur. Fatigue ou doute sont des signaux ; voyez la pause comme une préparation.",
      "Ce que vous repoussiez sera plus facile à commencer aujourd’hui. Un petit premier pas, avant la perfection, attire réponses et soutiens inattendus.",
      "L’intuition la plus importante du jour se cache dans vos liens. Écouter le sentiment derrière les mots peut remettre en marche des rouages bloqués.",
      "Aujourd’hui, la chance circule en lâchant prise. Libérez un projet, un poids tu ou un objet inutile : un nouvel élan prendra la place.",
      "Ce que vous avez bâti commence à porter ses fruits. Même si les résultats semblent modestes, les racines sont solides : reconnaissez le chemin parcouru.",
    ],
    action: [
      "Concrètement : notez ce matin la chose la plus importante en une ligne et consacrez-y cinq minutes avant midi.",
      "Concrètement : sortez cinq minutes à midi, respirez trois fois profondément, puis revoyez une tâche de l’après-midi.",
      "Concrètement : dites à un proche « merci, ça m’a aidé » avec une raison précise.",
      "Concrètement : envoyez avant le soir un message que vous repoussiez.",
      "Concrètement : rangez votre bureau ou votre sac dix minutes et laissez partir un objet inutile.",
      "Concrètement : posez votre téléphone avant de dormir et rappelez-vous trois réussites.",
    ],
    reflect: [
      "Ce soir, rappelez-vous un moment où vous avez vraiment pris soin de vous.",
      "En fin de journée, notez un mot sur ce qui vous a marqué ; demain sera plus clair.",
      "Avant de dormir, pensez à une personne croisée aujourd’hui et envoyez-lui votre gratitude.",
      "Si quelque chose a mal tourné, voyez-y un repère pour demain et laissez-le reposer.",
    ],
  },
};
