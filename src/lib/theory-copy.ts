import type { Language } from './translations';

/** Natural science and the app's symbolic vocabulary have separate, affirmative explanations. */
export const theoryCopy: Record<Language, { origin: string; birthColor: string; colorScope: string }> = {
  ja: {
    origin: '地球上のすべての生命は、潮の満ち引きや太陽の光など、大きな自然の循環の中で生きています。私たちも地球の引力に支えられ、月や太陽の引力が働く世界で生まれ、暮らしています。月と太陽の引力は潮の満ち引きに関わり、太陽の光は多くの生命のエネルギーの源になります。古くから人々は月・太陽・星々の巡りに心と体のリズムを重ね、誕生時の空を自分を見つめる原点としてきました。アゴルメンの羅針盤は、計算した天体位置と伝統的な暦を手がかりに、今の気持ちや暮らしを振り返る象徴的な地図を届けます。予定を見ながら明日の過ごし方を選ぶように、自分に合う航路を考えてみてくださいね。',
    birthColor: '生年月日や出生地などのプロフィールを、一人ひとりの色へつなげる独自のカラー理論です。バースカラーでは、その人らしさを色で表すイメージを「固有波動」と呼びます。ここでの波動は、好きな曲の雰囲気を色で描くような象徴です。「自分そのものの色」「豊かさの色」「対人の色」など、暮らしに寄り添う七つの色を用意しています。現在の配色は生年月日・出生時刻・出生都道府県と計算した太陽の位置から導き、血液型は別の象徴的な読み物で扱います。目に触れる色を、ひと息つく合図や自分の魅力を思い出す目印として楽しめますよ。',
    colorScope: 'プロフィールを色に置き換えた、自己理解と創作のための象徴的なパレットです。光の波長・振動数は、近い色の光を学ぶための参考値として別に紹介します。',
  },
  en: {
    origin: "All life on Earth lives within natural cycles, from tides to sunlight. We are born and live in a world held by Earth's gravity and influenced by the pull of the Moon and Sun. Their gravity helps shape tides, while sunlight supplies energy for much of life. People have long used the cycles of the Moon, Sun and stars, and the sky at birth, as starting points for reflection. Agolmen's Compass pairs calculated sky positions with traditional calendars in a symbolic map. Like checking your schedule for tomorrow, use it to think about your feelings, routines and next direction.",
    birthColor: 'Our original color model turns profile details such as birth date and birthplace into a personal palette. We use “unique vibration” as a symbolic name for expressing your individuality in color, like painting the mood of a favorite song. Seven colors accompany themes such as self, abundance and relationships. The current palette uses birth date, time, prefecture and calculated solar position; blood type belongs to a separate symbolic reading. Enjoy these colors as cues to pause and recall what you value.',
    colorScope: 'A symbolic palette for reflection and creative expression. Light wavelength and frequency are presented separately as educational references for similar spectral hues.',
  },
  'zh-CN': {
    origin: '地球上的生命都生活在潮汐、阳光等自然循环中。我们在地球引力的支撑下出生和生活，也处于月亮与太阳引力作用的世界。月亮与太阳的引力参与潮汐变化，阳光为许多生命提供能量。自古以来，人们把月亮、太阳和星辰的运行与身心节奏相联系，把出生时的天空当作认识自己的起点。阿戈尔曼罗盘结合计算出的天体位置和传统历法，提供一张象征地图。像查看明天的日程一样，用它回顾心情与生活，选择适合自己的方向吧。',
    birthColor: '这是把出生日期、出生地等资料对应为个人颜色的原创模型。“固有波动”在这里是用颜色表达个人特点的象征，就像画出喜欢的歌曲带来的感觉。七种颜色陪伴自我、丰盛、人际等生活主题。当前配色使用出生日期、时间、都道府县和计算出的太阳位置；血型用于另一份象征解读。让这些颜色成为停一停、想起自身魅力的小标记吧。',
    colorScope: '用于自我观察与创作的象征色盘。光的波长与频率另作科普参考，介绍相近光谱色的光。',
  },
  'zh-TW': {
    origin: '地球上的生命都生活在潮汐、陽光等自然循環中。我們在地球引力的支撐下出生和生活，也處於月亮與太陽引力作用的世界。月亮與太陽的引力參與潮汐變化，陽光為許多生命提供能量。自古以來，人們把月亮、太陽和星辰的運行與身心節奏相連，把出生時的天空當作認識自己的起點。阿戈爾曼羅盤結合計算出的天體位置和傳統曆法，提供一張象徵地圖。像查看明天的行程一樣，用它回顧心情與生活，選擇適合自己的方向吧。',
    birthColor: '這是把出生日期、出生地等資料對應為個人顏色的原創模型。「固有波動」在這裡是用顏色表達個人特點的象徵，就像畫出喜歡的歌曲帶來的感覺。七種顏色陪伴自我、豐盛、人際等生活主題。當前配色使用出生日期、時間、都道府縣和計算出的太陽位置；血型用於另一份象徵解讀。讓這些顏色成為停一停、想起自身魅力的小標記吧。',
    colorScope: '用於自我觀察與創作的象徵色盤。光的波長與頻率另作科普參考，介紹相近光譜色的光。',
  },
  ko: {
    origin: '지구의 모든 생명은 밀물과 썰물, 햇빛 같은 자연의 순환 속에서 살아요. 우리는 지구의 중력에 기대어 태어나고, 달과 태양의 인력이 작용하는 세상에서 살아갑니다. 달과 태양의 인력은 조수에 관여하고 햇빛은 많은 생명의 에너지원이 됩니다. 사람들은 오래전부터 달과 태양, 별의 움직임에 몸과 마음의 리듬을 비추고 태어난 하늘을 자신을 돌아보는 출발점으로 삼았어요. 아골멘의 나침반은 계산한 천체 위치와 전통 달력으로 상징 지도를 만듭니다. 내일 일정을 살펴보듯 지금 기분과 생활을 돌아보고 어울리는 방향을 골라 보세요.',
    birthColor: '생년월일과 출생지 같은 정보를 개인의 색으로 바꾸는 독자적인 모델이에요. “고유 진동”은 좋아하는 노래의 분위기를 색으로 그리듯 개성을 표현하는 상징입니다. 자신, 풍요, 관계 등의 주제에 일곱 색이 함께합니다. 현재 배색에는 생년월일, 시각, 도도부현과 계산한 태양 위치를 쓰고 혈액형은 별도의 상징 해석에서 다룹니다. 잠시 쉬거나 자신의 매력을 떠올리는 작은 표식으로 즐겨 보세요.',
    colorScope: '자기이해와 창작을 위한 상징 팔레트입니다. 빛의 파장과 주파수는 가까운 스펙트럼 색을 배우는 참고값으로 따로 소개해요.',
  },
  es: {
    origin: 'La vida en la Tierra forma parte de ciclos naturales como las mareas y la luz solar. Nacemos y vivimos sostenidos por la gravedad terrestre, en un mundo donde también actúan la Luna y el Sol. Su atracción influye en las mareas y la luz solar aporta energía a gran parte de la vida. Desde antiguo, las personas han usado los ciclos celestes y el cielo natal para reflexionar. La brújula de Agolmen une posiciones calculadas y calendarios tradicionales en un mapa simbólico. Como al revisar tu agenda de mañana, úsalo para pensar en tu ánimo, tus hábitos y tu siguiente rumbo.',
    birthColor: 'Nuestro modelo propio convierte datos como la fecha y el lugar de nacimiento en colores personales. “Vibración propia” es una expresión simbólica de tu individualidad en color, como pintar la sensación de una canción favorita. Siete colores acompañan temas como identidad, abundancia y relaciones. La paleta actual usa fecha, hora, prefectura y posición solar calculada; el grupo sanguíneo se trata en una lectura simbólica aparte. Disfruta del color como una señal para hacer una pausa y recordar lo que valoras.',
    colorScope: 'Paleta simbólica para conocerte y crear. La longitud de onda y la frecuencia se presentan aparte como referencias educativas de tonos espectrales parecidos.',
  },
  fr: {
    origin: 'La vie sur Terre suit de grands cycles naturels, des marées à la lumière solaire. Nous naissons et vivons soutenus par la gravité terrestre, dans un monde où agissent aussi la Lune et le Soleil. Leur attraction participe aux marées et la lumière solaire nourrit une grande partie du vivant. Depuis longtemps, les cycles célestes et le ciel natal servent de points de départ à la réflexion. La boussole d’Agolmen associe positions calculées et calendriers traditionnels dans une carte symbolique. Comme en regardant votre agenda de demain, servez-vous-en pour réfléchir à votre humeur, vos habitudes et votre direction.',
    birthColor: 'Notre modèle original transforme la date et le lieu de naissance en couleurs personnelles. « Vibration propre » désigne ici une image symbolique de votre individualité en couleur, comme peindre l’ambiance d’une chanson aimée. Sept couleurs accompagnent les thèmes de soi, de l’abondance et des relations. La palette actuelle utilise date, heure, préfecture et position solaire calculée ; le groupe sanguin figure dans une lecture symbolique distincte. Profitez du coloris comme d’un repère pour faire une pause et retrouver ce qui compte pour vous.',
    colorScope: 'Une palette symbolique pour la réflexion et la création. Longueur d’onde et fréquence sont présentées séparément comme références éducatives de teintes spectrales proches.',
  },
};