import type { Language } from "./translations";
import type { Element } from "./team-analysis";

type CompanionCopy = {
  day: Record<Element, string>;
  relation: Record<"same" | "support" | "give" | "pressure" | "lead", string>;
  rhythm: (lowest: string) => string;
  colorDaily: string[];
  colorScenes: string[];
  advance: [string, string];
  protect: [string, string];
};

export const companionCopy: Record<Language, CompanionCopy> = {
  ja: {
    day: {
      wood: "今日の参考テーマは、小さな準備です。料理の材料を先に一つ出す感じなんだよね。新しいことを始める前に、使う道具を一つ用意してみてね。",
      fire: "今日の参考テーマは、伝えることです。スマホの通知が多いと、大事な一件が埋もれますよね。今日は話す前に、一番伝えたいことを一行だけ書いてみてね。",
      earth: "今日の参考テーマは、始める前の確認です。買い物前に冷蔵庫を見るのと同じですね。午前中に、まだ終わっていない約束を一つ確かめてみてね。",
      metal: "今日の参考テーマは、一つ選ぶことです。スマホのタブを一つ閉じる感じなんだよね。今日は作業を一つ減らして、残した一件を最後までやってみてね。",
      water: "今日の参考テーマは、ひと呼吸です。料理の味見みたいに、一度止まると次に足すものが見えますよね。返事の前に疑問を一つメモして、必要な情報を確かめてみてね。",
    },
    relation: {
      same: "参考の組み合わせでは、自分のペースを確かめることがテーマです。慣れた道具を使うように、今日は得意な作業を一つ選んで始めてみませんか。",
      support: "参考の組み合わせでは、助けを借りることがテーマです。買い物袋も二人で持つと分けられますね。今日、頼みたいことを一つ具体的に伝える選択があります。",
      give: "参考の組み合わせでは、力の分け方がテーマです。人に料理を取り分けても、自分のお皿は残しておきたいですね。手伝う前に、使える時間を一つ伝えてみませんか。",
      pressure: "参考の組み合わせでは、予定の余白がテーマです。満員のカートには、もう一品が入りませんね。今日は予定を一件見直し、確認の時間を10分残すのはいかがでしょう。",
      lead: "参考の組み合わせでは、方向を示すことがテーマです。待ち合わせ場所が決まると動きやすいですよね。今日の相談では、まず選択肢を二つに絞って伝えてみませんか。",
    },
    rhythm: lowest => `参考の3つの波では「${lowest}」の値が一番低い日です。この波は生年月日から描く振り返り用のカーブなんだよね。体調は今の感覚と実際の症状を手がかりにしてね。次の作業の前に、5分の休憩を入れる選択もありますよ。`,
    colorDaily: ["今日、スマホ壁紙に小さな差し色を一か所だけ使ってみてね。通知の目印みたいに、見るたびに今日の目的を一つ思い出す合図になりますよ。文字が読みやすい明るさを選んでね。", "次の買い物前に、財布やメモにこの色を少し添えてみてね。「今必要なものは？」と一度考える目印なんだよね。予算を先に一行書くと、選ぶ順番を整理できますよ。", "明日はハンカチやクッション一つから試してみてね。料理の薬味みたいに、少しの色で雰囲気を楽しめますよ。アロマコインも、好きな色を添える飾りとして使えます。"],
    colorScenes: ["明日の説明前に、仕事色でノートに印をつけて、伝えたいことを一行書いてみてね。道案内の看板みたいに、言いたいことが見つけやすくなりますよ。実際の準備と相手との会話を味方につけよう。", "今日の休憩に、休息色の小物を視界の隅へ置いてみてね。目にやさしい明るさを選んで、楽な姿勢で5分休む合図にできますよ。体調や睡眠の悩みは、症状に合った医療の相談を頼りにしてね。", "次の会話で、対人色の小物を「最後まで聞く」目印にしてみてね。会話はキャッチボールなんだよね。相手が話し終えてから「つまり、こういうこと？」と一つ確かめてみよう。"],
    advance: ["今日は準備した提案を一件、小さく試す選択があります。送信前に目的・相手の利点・次の一歩を三行にすると、道案内のように伝わりやすくなりますよ。", "今日は完成品より、15分の試作から始めるのはいかがでしょう。料理の味見のように、不明点を一つ確かめるだけでも前進ですね。"],
    protect: ["大きな判断の前に、費用・期限・別の案を紙に書いてみませんか。買い物リストのように整理し、信頼できる人に一度確認する選択もありますよ。", "引き受ける前に、所要時間と締切を確かめてみませんか。予定に30分の余白を残すと、急な用事を入れる場所も作れますね。"],
  },
  en: {
    day: { wood: "Today's reference theme is preparation, like setting out ingredients. This morning, you could gather one thing for a new task; the whole kitchen need not be ready.", fire: "Today's reference theme is expression. Too many phone notifications hide the important one. Before speaking today, you could write your main point in one line.", earth: "Today's reference theme is foundations. Like checking the fridge before shopping, a quick check helps. This morning, you could review one outstanding promise.", metal: "Today's reference theme is choosing. Like closing a browser tab, you could set one task aside and finish one remaining item this evening.", water: "Today's reference theme is reflection. Tasting a dish shows what is missing. Before replying, you could note one question and check the information you need." },
    relation: { same: "This reference pairing invites you to check your own pace. Like choosing a familiar tool, you could start with one task you know well today.", support: "This reference pairing suggests sharing the load. Shopping bags are easier to divide than to juggle. Today, you could make one specific request for help.", give: "This reference pairing invites you to share without emptying your own plate. Before helping today, you could say how much time you have.", pressure: "This reference pairing invites you to leave room. An overflowing shopping cart has no space for the next item. Today, you could review one commitment and leave ten minutes for checking.", lead: "This reference pairing invites a clear direction. A meeting place helps everyone move. In today's discussion, you could offer two options first." },
    rhythm: low => `“${low}” is lowest in the three reference waves. These curves come from your birth date and offer a prompt for reflection. Let your real feelings and symptoms guide health decisions. You could take a five-minute break before the next task.`,
    colorDaily: ["Try one small wallpaper accent today, like a notification marker for your main aim. Keep the words easy to read.", "Before shopping, add a color mark to your list as a cue to ask what you need. Write your budget in one line to help choose.", "Tomorrow, try one scarf or cushion. Like a garnish, a little color adds character. An aroma coin can be a decorative color detail."],
    colorScenes: ["Before tomorrow’s explanation, mark one key line with your work color, like a signpost. Preparation and conversation are your practical tools.", "At today’s break, place a rest-color object at the edge of your view. Choose gentle brightness and sit comfortably for five minutes. For health or sleep concerns, seek medical guidance suited to your symptoms.", "Before the next conversation, use a color detail to remember to listen fully. Like playing catch, take your turn after the other person finishes and check one point."],
    advance: ["Today, you could test one prepared proposal. Before sending it, write the goal, benefit and next step in three lines, like clear directions.", "Today, you could try a fifteen-minute prototype. Like tasting a dish, resolving one question is a useful start."],
    protect: ["Before a major decision, you could list costs, deadlines and alternatives, like a shopping list, then ask a trusted person to review it.", "Before agreeing, you could check the time needed and deadline. Leaving thirty minutes free gives unexpected tasks somewhere to land."],
  },
  "zh-CN": {
    day: { wood: "今天的参考主题是准备，就像做饭前备料。早上不妨先准备一件需要的东西，不必一次把厨房都搬出来。", fire: "今天的参考主题是表达。手机通知太多，重要消息反而容易被淹没。开口前，不妨把重点写成一句话。", earth: "今天的参考主题是基础。像买菜前查看冰箱一样，上午不妨核对一项还没完成的约定。", metal: "今天的参考主题是选择。像关掉一个浏览器标签页一样，不妨放下一项任务，晚上完成另一件小事。", water: "今天的参考主题是思考。做饭尝一口，就知道还缺什么。回复前不妨记下一个疑问，再查需要的信息。" },
    relation: { same: "这个参考组合提醒您确认自己的节奏。像选熟悉的工具一样，今天不妨先做一件擅长的小事。", support: "这个参考组合提醒您分担。购物袋可以分着拿，不必一个人练杂技。今天不妨提出一个具体的请求。", give: "这个参考组合提醒您分配精力。给别人盛菜时，也请留住自己的那一份。帮忙前不妨说明可用的时间。", pressure: "这个参考组合提醒您留出空间。满满的购物车已经放不下新东西了。今天不妨调整一个安排，留十分钟核对。", lead: "这个参考组合提醒您明确方向。约好见面地点，大家才容易行动。今天讨论时，不妨先提出两个选项。" },
    rhythm: low => `参考的三条波线里，“${low}”今天最低。这些曲线按生日绘制，供你回顾生活。身体状况请以真实感受和症状为准。下一项任务前，休息五分钟也是一个选择。`,
    colorDaily: ["今天给壁纸加一点颜色吧，像通知标记一样提醒当天的重点，同时让文字清楚。", "购物前在清单加一点颜色，提醒自己想一想需要什么。先写一行预算，选择会更清楚。", "明天从一条手帕或一个靠垫试起吧，像调味料一样享受小小的变化。香薰币也可当彩色装饰。"],
    colorScenes: ["明天说明前，用工作色标一行重点吧，像路标一样清楚。准备和交流是实际的帮手。", "今天休息时，把休息色小物放在视线边缘，选柔和亮度，舒服地坐五分钟。健康与睡眠问题请寻求符合症状的医疗建议。", "下次聊天用人际色提醒自己听完吧。像接球一样，等对方说完再问一句：“你的意思是这样吗？”"],
    advance: ["今天不妨小范围试一份准备好的提案。发送前用三行写明目的、好处和下一步，像指路一样清楚。", "今天不妨先做十五分钟的小试作。像做饭尝味一样，确认一个疑问也是前进。"],
    protect: ["重要决定前，不妨像写购物清单一样列出费用、期限和其他选项，再请可信赖的人核对一次。", "答应前不妨确认所需时间和期限。留三十分钟空余，临时事务也有地方安排。"],
  },
  "zh-TW": {
    day: { wood: "今天的參考主題是準備，就像做飯前備料。早上不妨先準備一件需要的東西，不必一次把廚房都搬出來。", fire: "今天的參考主題是表達。手機通知太多，重要訊息反而容易被淹沒。開口前，不妨把重點寫成一句話。", earth: "今天的參考主題是基礎。像買菜前查看冰箱一樣，上午不妨核對一項還沒完成的約定。", metal: "今天的參考主題是選擇。像關掉一個瀏覽器分頁一樣，不妨放下一項任務，晚上完成另一件小事。", water: "今天的參考主題是思考。做飯嚐一口，就知道還缺什麼。回覆前不妨記下一個疑問，再查需要的資訊。" },
    relation: { same: "這個參考組合提醒您確認自己的節奏。像選熟悉的工具一樣，今天不妨先做一件擅長的小事。", support: "這個參考組合提醒您分擔。購物袋可以分著拿，不必一個人練雜技。今天不妨提出一個具體的請求。", give: "這個參考組合提醒您分配精力。給別人盛菜時，也請留住自己的那一份。幫忙前不妨說明可用的時間。", pressure: "這個參考組合提醒您留出空間。滿滿的購物車已經放不下新東西了。今天不妨調整一個安排，留十分鐘核對。", lead: "這個參考組合提醒您明確方向。約好見面地點，大家才容易行動。今天討論時，不妨先提出兩個選項。" },
    rhythm: low => `參考的三條波線裡，「${low}」今天最低。這些曲線按生日繪製，供你回顧生活。身體狀況請以真實感受和症狀為準。下一項任務前，休息五分鐘也是一個選擇。`,
    colorDaily: ["今天給桌布加一點顏色吧，像通知標記一樣提醒當天的重點，同時讓文字清楚。", "購物前在清單加一點顏色，提醒自己想一想需要什麼。先寫一行預算，選擇會更清楚。", "明天從一條手帕或一個靠墊試起吧，像調味料一樣享受小小的變化。香氛幣也可當彩色裝飾。"],
    colorScenes: ["明天說明前，用工作色標一行重點吧，像路標一樣清楚。準備和交流是實際的幫手。", "今天休息時，把休息色小物放在視線邊緣，選柔和亮度，舒服地坐五分鐘。健康與睡眠問題請尋求符合症狀的醫療建議。", "下次聊天用人際色提醒自己聽完吧。像接球一樣，等對方說完再問一句：「你的意思是這樣嗎？」"],
    advance: ["今天不妨小範圍試一份準備好的提案。傳送前用三行寫明目的、好處和下一步，像指路一樣清楚。", "今天不妨先做十五分鐘的小試作。像做飯嚐味一樣，確認一個疑問也是前進。"],
    protect: ["重要決定前，不妨像寫購物清單一樣列出費用、期限和其他選項，再請可信賴的人核對一次。", "答應前不妨確認所需時間和期限。留三十分鐘空餘，臨時事務也有地方安排。"],
  },
  ko: {
    day: { wood: "오늘의 참고 주제는 요리 전 재료를 준비하듯 작은 준비입니다. 아침에 필요한 것 하나를 챙겨 보셔도 좋겠어요. 주방 전체를 꺼낼 필요는 없지요.", fire: "오늘의 참고 주제는 표현입니다. 휴대폰 알림이 많으면 중요한 소식이 묻히지요. 말하기 전에 핵심을 한 줄 적어 보시면 어떨까요?", earth: "오늘의 참고 주제는 기초입니다. 장보기 전 냉장고를 확인하듯, 오전에 남은 약속 하나를 살펴보셔도 좋겠습니다.", metal: "오늘의 참고 주제는 선택입니다. 브라우저 탭 하나를 닫듯 일을 하나 줄이고, 저녁에 작은 일 하나를 마쳐 보시면 어떨까요?", water: "오늘의 참고 주제는 생각할 여유입니다. 요리는 맛을 보면 필요한 것이 보이지요. 답하기 전에 질문 하나를 적고 정보를 확인해 보셔도 좋겠습니다." },
    relation: { same: "이 참고 조합은 자신의 속도를 확인하는 계기입니다. 익숙한 도구를 고르듯 오늘 잘 아는 일 하나부터 시작해 보시면 어떨까요?", support: "이 참고 조합은 도움을 나누는 계기입니다. 장바구니는 혼자 묘기하듯 들기보다 나눌 수 있지요. 오늘 구체적인 부탁 하나를 전해 보셔도 좋겠습니다.", give: "이 참고 조합은 힘을 나누는 계기입니다. 음식을 나눠도 자신의 접시는 남겨 두고 싶지요. 돕기 전에 가능한 시간을 알려 보시면 어떨까요?", pressure: "이 참고 조합은 여백을 만드는 계기입니다. 가득 찬 카트에는 물건을 더 담기 어렵지요. 오늘 일정 하나를 조정해 확인할 시간 10분을 남겨 보셔도 좋겠습니다.", lead: "이 참고 조합은 방향을 정하는 계기입니다. 만날 장소가 정해지면 움직이기 쉽지요. 오늘 대화에서는 두 가지 선택지를 먼저 제안해 보시면 어떨까요?" },
    rhythm: low => `참고용 세 곡선에서 ‘${low}’ 값이 가장 낮은 날이에요. 생년월일로 그린 돌아보기용 곡선입니다. 몸 상태는 실제 느낌과 증상을 기준으로 살펴 주세요. 다음 일 전에 5분 쉬는 것도 좋은 선택이에요.`,
    colorDaily: ["오늘 배경화면에 작은 색 포인트를 넣어 보세요. 알림 표시처럼 목표를 떠올리며 글자는 읽기 편하게 해 주세요.", "장보기 전 목록에 색 표시를 하고 필요한 것을 떠올려 보세요. 예산을 한 줄 적으면 고르기 쉬워져요.", "내일 손수건이나 쿠션 하나로 즐겨 보세요. 양념처럼 작은 색이 분위기를 더해요. 아로마 코인도 색 장식으로 쓸 수 있어요."],
    colorScenes: ["내일 설명 전 업무색으로 핵심 한 줄을 표시해 보세요. 표지판처럼 명확하게요. 준비와 대화가 실제 도움이 됩니다.", "오늘 휴식색 소품을 시야 가장자리에 놓고 부드러운 밝기에서 편히 5분 쉬어 보세요. 건강과 수면 문제는 증상에 맞는 의료 안내를 참고해 주세요.", "다음 대화에서 관계색을 끝까지 듣는 표식으로 써 보세요. 공을 받듯 상대가 마친 뒤 뜻을 한 번 확인해 보세요."],
    advance: ["오늘 준비한 제안 하나를 작게 시험해 보시면 어떨까요? 보내기 전에 목적, 장점, 다음 단계를 길 안내처럼 세 줄로 적어 보셔도 좋겠습니다.", "오늘은 15분짜리 작은 시도부터 해 보셔도 좋겠습니다. 요리의 맛을 보듯 질문 하나를 확인하는 것도 진전이지요."],
    protect: ["큰 결정 전에 장보기 목록처럼 비용, 기한, 다른 선택지를 적고 믿을 만한 사람에게 한 번 확인받는 것도 좋겠습니다.", "수락하기 전에 필요한 시간과 기한을 확인해 보시면 어떨까요? 30분의 여유는 갑작스러운 일이 들어갈 자리가 됩니다."],
  },
  es: {
    day: { wood: "El tema orientativo de hoy es preparar, como reunir ingredientes. Esta mañana puede dejar lista una cosa para una tarea nueva; no hace falta sacar toda la cocina.", fire: "El tema orientativo es expresarse. Muchas notificaciones ocultan la importante. Antes de hablar hoy, puede escribir su idea principal en una línea.", earth: "El tema orientativo es la base. Como mirar la nevera antes de comprar, esta mañana puede revisar un compromiso pendiente.", metal: "El tema orientativo es elegir. Como cerrar una pestaña, puede apartar una tarea y terminar otra esta tarde.", water: "El tema orientativo es reflexionar. Probar un plato revela lo que falta. Antes de responder, puede anotar una pregunta y comprobar la información." },
    relation: { same: "Esta combinación orientativa invita a revisar su ritmo. Como elegir una herramienta conocida, hoy puede empezar por una tarea familiar.", support: "Esta combinación invita a compartir la carga. Las bolsas se pueden repartir, no hace falta hacer malabares. Hoy puede pedir una ayuda concreta.", give: "Esta combinación invita a repartir sin vaciar su propio plato. Antes de ayudar hoy, puede indicar cuánto tiempo tiene.", pressure: "Esta combinación invita a dejar espacio. Un carro lleno no admite otra compra. Hoy puede revisar un compromiso y reservar diez minutos para comprobarlo.", lead: "Esta combinación invita a aclarar la dirección. Un lugar de encuentro facilita moverse. En la conversación de hoy puede ofrecer primero dos opciones." },
    rhythm: low => `«${low}» es el valor más bajo de las tres ondas de referencia. Son curvas trazadas desde tu cumpleaños para reflexionar. Para la salud, guíate por tus sensaciones y síntomas reales. Puedes descansar cinco minutos antes de la siguiente tarea.`,
    colorDaily: ["Prueba hoy un detalle de color en el móvil como aviso de tu objetivo. Mantén las palabras legibles.", "Antes de comprar, marca la lista con color para recordar qué necesitas. Escribe tu presupuesto en una línea.", "Mañana prueba un pañuelo o cojín. Como un condimento, un poco añade carácter. Una moneda aromática sirve como decoración."],
    colorScenes: ["Antes de explicar algo mañana, marca una frase con tu color de trabajo, como una señal. Prepararte y conversar son tus herramientas prácticas.", "En la pausa, coloca un objeto de tu color de descanso al borde de la vista y siéntate cinco minutos con luz suave. Consulta orientación médica para síntomas de salud o sueño.", "En la próxima charla, usa el color para recordar escuchar. Como al recibir una pelota, espera tu turno y confirma una idea."],
    advance: ["Hoy puede probar una propuesta preparada a pequeña escala. Antes de enviarla, escriba objetivo, beneficio y siguiente paso en tres líneas, como una indicación clara.", "Hoy puede probar durante quince minutos. Como probar un plato, aclarar una duda ya es avanzar."],
    protect: ["Antes de decidir algo importante, puede listar costes, plazos y alternativas como una lista de compras y pedir una revisión de confianza.", "Antes de aceptar, puede comprobar tiempo y plazo. Reservar treinta minutos deja sitio para lo imprevisto."],
  },
  fr: {
    day: { wood: "Le thème indicatif du jour est la préparation, comme sortir les ingrédients. Ce matin, vous pourriez préparer une chose pour une nouvelle tâche, sans sortir toute la cuisine.", fire: "Le thème indicatif est l’expression. Trop de notifications cachent la plus importante. Avant de parler aujourd’hui, vous pourriez écrire votre idée en une ligne.", earth: "Le thème indicatif est la base. Comme regarder le réfrigérateur avant les courses, vous pourriez vérifier un engagement ce matin.", metal: "Le thème indicatif est le choix. Comme fermer un onglet, vous pourriez écarter une tâche et en terminer une autre ce soir.", water: "Le thème indicatif est la réflexion. Goûter un plat révèle ce qui manque. Avant de répondre, vous pourriez noter une question et vérifier l’information." },
    relation: { same: "Cette combinaison indicative invite à vérifier votre rythme. Comme choisir un outil familier, vous pourriez commencer par une tâche connue aujourd’hui.", support: "Cette combinaison invite à partager la charge. Les sacs peuvent se répartir, sans numéro de jonglage. Aujourd’hui, vous pourriez demander une aide précise.", give: "Cette combinaison invite à partager sans vider votre assiette. Avant d’aider aujourd’hui, vous pourriez préciser le temps disponible.", pressure: "Cette combinaison invite à laisser de la place. Un chariot plein ne peut plus rien accueillir. Aujourd’hui, vous pourriez revoir un engagement et garder dix minutes pour vérifier.", lead: "Cette combinaison invite à clarifier la direction. Un lieu de rendez-vous facilite le départ. Dans votre discussion, vous pourriez proposer d’abord deux options." },
    rhythm: low => `« ${low} » est le plus bas des trois courbes de référence. Elles sont tracées depuis votre date de naissance pour réfléchir. Pour la santé, fiez-vous à vos sensations et symptômes réels. Une pause de cinq minutes avant la prochaine tâche est une option.`,
    colorDaily: ["Essayez une petite touche sur le téléphone, comme un rappel de votre objectif. Gardez les mots lisibles.", "Avant les courses, marquez la liste en couleur pour réfléchir à vos besoins. Notez votre budget en une ligne.", "Demain, essayez un foulard ou un coussin. Comme un condiment, une touche donne du caractère. Une pièce aromatique peut servir de décoration."],
    colorScenes: ["Avant votre explication de demain, marquez une phrase avec la couleur du travail, comme un panneau. Préparation et dialogue sont vos outils concrets.", "Pendant la pause, placez un objet de la couleur du repos en bord de vue et asseyez-vous cinq minutes sous une lumière douce. Pour les symptômes liés à la santé ou au sommeil, cherchez un conseil médical adapté.", "Lors du prochain échange, utilisez la couleur comme rappel d’écouter. Comme pour recevoir une balle, attendez la fin puis vérifiez une idée."],
    advance: ["Aujourd’hui, vous pourriez tester une proposition préparée à petite échelle. Avant l’envoi, résumez objectif, avantage et prochaine étape en trois lignes, comme un itinéraire clair.", "Aujourd’hui, vous pourriez essayer un prototype pendant quinze minutes. Comme goûter un plat, éclaircir une question est déjà un pas."],
    protect: ["Avant une décision importante, vous pourriez noter coûts, délais et alternatives comme une liste de courses, puis demander un avis de confiance.", "Avant d’accepter, vous pourriez vérifier le temps et le délai. Garder trente minutes libres laisse de la place à l’imprévu."],
  },
};