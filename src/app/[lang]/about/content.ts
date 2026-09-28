import type { Locale } from '@/lib/i18n.config'

type AboutContent = {
  intro: string; landscape: string; yurt: string; story: string; explore: string;
  cards: readonly [string, string][];
  journey: string; steps: readonly [string, string][];
  invitation: string; invitationBody: string;
  reviews: string; previous: string; next: string; loading: string; empty: string;
}

export const aboutContent: Record<Locale, AboutContent> = {
  en: {
    intro: 'A country to discover. People to connect with. A journey to make your own.',
    landscape: 'On the shores of Issyk-Kul', yurt: 'A little closer to nomadic life',
    story: 'Good journeys begin with a human connection.', explore: 'Your way into Kyrgyzstan',
    cards: [['Find your somewhere', 'Explore lakes, mountain valleys and places worth taking your time for.'], ['Make room for adventure', 'Browse itineraries and find a journey that fits your interests.'], ['Go a little deeper', 'Read stories and practical guides before you set off.']],
    journey: 'From an idea to your next adventure.',
    steps: [['Get inspired', 'Start with a place, a landscape or an experience that stays with you.'], ['Tell us your plans', 'Share your dates, group size and the things you would love to do.'], ['Shape the details together', 'Discuss the route, pace and practical arrangements with our team.']],
    invitation: 'Your next story starts here.', invitationBody: 'A first visit or a return to somewhere you love — tell us what you have in mind.',
    reviews: 'What our clients say', previous: 'Previous reviews', next: 'Next reviews', loading: 'Loading traveller reviews…', empty: 'Have a question about travelling with us? Get in touch with our team.',
  },
  fr: {
    intro: 'Un pays à découvrir. Des rencontres à vivre. Un voyage qui vous ressemble.',
    landscape: 'Sur les rives du lac Issyk-Koul', yurt: 'Au plus près de la vie nomade',
    story: 'Les beaux voyages commencent par une rencontre.', explore: 'À la découverte du Kirghizistan',
    cards: [['Trouvez votre ailleurs', 'Explorez les lacs, les vallées et les lieux où prendre son temps.'], ['Place à l’aventure', 'Découvrez des itinéraires et un voyage adapté à vos envies.'], ['Allez plus loin', 'Lisez nos récits et conseils pratiques avant de partir.']],
    journey: 'D’une idée à votre prochaine aventure.',
    steps: [['Laissez-vous inspirer', 'Commencez par un lieu, un paysage ou une expérience qui vous attire.'], ['Parlez-nous de votre projet', 'Précisez vos dates, la taille du groupe et vos envies.'], ['Construisons les détails ensemble', 'Échangez avec notre équipe sur le parcours, le rythme et l’organisation.']],
    invitation: 'Votre prochaine histoire commence ici.', invitationBody: 'Une première visite ou le plaisir de revenir : racontez-nous vos envies.',
    reviews: 'Témoignages', previous: 'Avis précédents', next: 'Avis suivants', loading: 'Chargement des témoignages…', empty: 'Une question sur nos voyages ? Contactez notre équipe.',
  },
  de: {
    intro: 'Ein Land entdecken. Menschen begegnen. Die eigene Reise gestalten.',
    landscape: 'Am Ufer des Issyk-Kul', yurt: 'Dem Nomadenleben ein Stück näher',
    story: 'Gute Reisen beginnen mit einer Begegnung.', explore: 'Ihr Weg nach Kirgisistan',
    cards: [['Finden Sie Ihren Lieblingsort', 'Entdecken Sie Seen, Bergtäler und Orte, an denen man gerne verweilt.'], ['Zeit für Abenteuer', 'Entdecken Sie Reiserouten, die zu Ihren Interessen passen.'], ['Erfahren Sie mehr', 'Lesen Sie Geschichten und praktische Tipps vor Ihrer Abreise.']],
    journey: 'Von der Idee zum nächsten Abenteuer.',
    steps: [['Inspiration finden', 'Beginnen Sie mit einem Ort, einer Landschaft oder einem Erlebnis, das Sie begeistert.'], ['Pläne mit uns teilen', 'Nennen Sie uns Ihre Reisedaten, Gruppengröße und Wünsche.'], ['Gemeinsam Details planen', 'Besprechen Sie Route, Tempo und Organisation mit unserem Team.']],
    invitation: 'Ihre nächste Geschichte beginnt hier.', invitationBody: 'Ob erster Besuch oder Wiedersehen mit einem Lieblingsort – erzählen Sie uns von Ihren Plänen.',
    reviews: 'Was unsere Kunden sagen', previous: 'Vorherige Bewertungen', next: 'Nächste Bewertungen', loading: 'Bewertungen werden geladen…', empty: 'Fragen zu einer Reise mit uns? Kontaktieren Sie unser Team.',
  },
  es: {
    intro: 'Un país por descubrir. Personas por conocer. Un viaje a tu manera.',
    landscape: 'A orillas del lago Issyk-Kul', yurt: 'Un poco más cerca de la vida nómada',
    story: 'Los grandes viajes empiezan con una conexión humana.', explore: 'Tu puerta a Kirguistán',
    cards: [['Encuentra tu lugar', 'Explora lagos, valles de montaña y lugares para disfrutar sin prisas.'], ['Haz sitio a la aventura', 'Descubre itinerarios y encuentra un viaje acorde con tus intereses.'], ['Descubre un poco más', 'Lee historias y consejos prácticos antes de partir.']],
    journey: 'De una idea a tu próxima aventura.',
    steps: [['Inspírate', 'Empieza por un lugar, un paisaje o una experiencia que te ilusione.'], ['Cuéntanos tus planes', 'Comparte tus fechas, el tamaño del grupo y lo que te gustaría hacer.'], ['Definamos los detalles juntos', 'Habla con nuestro equipo sobre la ruta, el ritmo y la organización.']],
    invitation: 'Tu próxima historia empieza aquí.', invitationBody: 'Tu primera visita o el regreso a un lugar querido: cuéntanos qué tienes en mente.',
    reviews: 'Lo que dicen nuestros clientes', previous: 'Opiniones anteriores', next: 'Opiniones siguientes', loading: 'Cargando opiniones…', empty: '¿Tienes preguntas sobre viajar con nosotros? Contacta con nuestro equipo.',
  },
  it: {
    intro: 'Un paese da scoprire. Persone da incontrare. Un viaggio tutto tuo.',
    landscape: 'Sulle rive del lago Issyk-Kul', yurt: 'Più vicini alla vita nomade',
    story: 'I bei viaggi iniziano con un incontro.', explore: 'La tua porta sul Kirghizistan',
    cards: [['Trova il tuo luogo speciale', 'Esplora laghi, valli montane e luoghi da vivere senza fretta.'], ['Fai spazio all’avventura', 'Scopri itinerari e trova un viaggio adatto ai tuoi interessi.'], ['Scopri qualcosa in più', 'Leggi racconti e consigli pratici prima di partire.']],
    journey: 'Da un’idea alla tua prossima avventura.',
    steps: [['Lasciati ispirare', 'Parti da un luogo, un paesaggio o un’esperienza che ti emoziona.'], ['Raccontaci i tuoi piani', 'Condividi date, numero di partecipanti e ciò che vorresti fare.'], ['Definiamo insieme i dettagli', 'Parla con il nostro team del percorso, del ritmo e dell’organizzazione.']],
    invitation: 'La tua prossima storia inizia qui.', invitationBody: 'Una prima visita o il ritorno in un luogo amato: raccontaci cosa hai in mente.',
    reviews: 'Cosa dicono i nostri clienti', previous: 'Recensioni precedenti', next: 'Recensioni successive', loading: 'Caricamento delle recensioni…', empty: 'Hai domande sui nostri viaggi? Contatta il nostro team.',
  },
  ru: {
    intro: 'Открывайте страну. Знакомьтесь с людьми. Путешествуйте по-своему.',
    landscape: 'На берегу Иссык-Куля', yurt: 'Чуть ближе к жизни кочевников',
    story: 'Хорошее путешествие начинается со знакомства.', explore: 'Ваш путь к открытию Кыргызстана',
    cards: [['Найдите своё место', 'Откройте озёра, горные долины и места, где хочется задержаться.'], ['Оставьте время для приключений', 'Изучите маршруты и выберите путешествие по своим интересам.'], ['Узнайте больше', 'Почитайте истории и практические советы перед поездкой.']],
    journey: 'От идеи до нового приключения.',
    steps: [['Вдохновитесь', 'Начните с места, пейзажа или впечатления, которое вас привлекает.'], ['Расскажите о планах', 'Сообщите даты, количество путешественников и ваши пожелания.'], ['Обсудим детали вместе', 'Поговорите с нашей командой о маршруте, темпе и организации поездки.']],
    invitation: 'Ваша следующая история начинается здесь.', invitationBody: 'Первая поездка или возвращение в любимые места — расскажите нам о своих планах.',
    reviews: 'Что говорят наши клиенты', previous: 'Предыдущие отзывы', next: 'Следующие отзывы', loading: 'Загружаем отзывы путешественников…', empty: 'Есть вопросы о путешествии с нами? Свяжитесь с нашей командой.',
  },
  ae: {
    intro: 'بلد تكتشفه. وأناس تتعرف إليهم. ورحلة تصنعها على طريقتك.',
    landscape: 'على ضفاف بحيرة إيسيك كول', yurt: 'أقرب إلى حياة الرحّل',
    story: 'تبدأ الرحلات الجميلة بالتواصل بين الناس.', explore: 'بوابتك لاكتشاف قيرغيزستان',
    cards: [['اعثر على مكانك المفضل', 'اكتشف البحيرات والوديان الجبلية والأماكن التي تستحق أن تتمهل فيها.'], ['أفسح مجالاً للمغامرة', 'تصفح مسارات الرحلات واختر ما يناسب اهتماماتك.'], ['اكتشف المزيد', 'اقرأ القصص والنصائح العملية قبل انطلاقك.']],
    journey: 'من فكرة إلى مغامرتك القادمة.',
    steps: [['ابدأ بالإلهام', 'ابدأ بمكان أو منظر طبيعي أو تجربة تتطلع إليها.'], ['أخبرنا بخططك', 'شاركنا مواعيدك وعدد المسافرين والأنشطة التي ترغب فيها.'], ['لنرتب التفاصيل معاً', 'ناقش مع فريقنا المسار ووتيرة الرحلة والترتيبات العملية.']],
    invitation: 'حكايتك القادمة تبدأ هنا.', invitationBody: 'سواء كانت زيارتك الأولى أو عودة إلى مكان تحبه، أخبرنا بما تفكر فيه.',
    reviews: 'ما يقوله عملاؤنا', previous: 'التقييمات السابقة', next: 'التقييمات التالية', loading: 'جارٍ تحميل آراء المسافرين…', empty: 'هل لديك سؤال عن السفر معنا؟ تواصل مع فريقنا.',
  },
  cn: {
    intro: '探索一个国家，结识当地的人，开启属于自己的旅程。',
    landscape: '在伊塞克湖畔', yurt: '走近游牧生活',
    story: '美好的旅程，从人与人的相遇开始。', explore: '开启你的吉尔吉斯斯坦之旅',
    cards: [['发现心仪的地方', '探索湖泊、山谷，以及值得放慢脚步的风景。'], ['给冒险留些空间', '浏览行程，寻找符合你兴趣的旅行。'], ['了解更多', '出发前，阅读旅行故事和实用指南。']],
    journey: '从一个想法，到下一段冒险。',
    steps: [['寻找灵感', '从一个地方、一片风景或一种心动的体验开始。'], ['告诉我们你的计划', '分享出行日期、人数和你想体验的活动。'], ['一起商量细节', '与我们的团队讨论路线、节奏和具体安排。']],
    invitation: '你的下一个故事，从这里开始。', invitationBody: '无论是初次到访，还是重返心爱的地方，都欢迎告诉我们你的想法。',
    reviews: '客户评价', previous: '上一组评价', next: '下一组评价', loading: '正在加载旅行者评价…', empty: '对与我们一起旅行有疑问？欢迎联系我们的团队。',
  },
  jp: {
    intro: '国を知り、人と出会う。自分らしい旅へ。',
    landscape: 'イシク・クル湖のほとりで', yurt: '遊牧の暮らしを身近に',
    story: '素敵な旅は、人とのつながりから。', explore: 'キルギスを知る旅の入口',
    cards: [['お気に入りの場所を探す', '湖や山あいの谷、ゆっくり過ごしたくなる場所を巡りましょう。'], ['冒険の時間をつくる', '旅程を見ながら、興味に合った旅を見つけましょう。'], ['もう少し深く知る', '出発前に、旅の物語や実用的なガイドをお読みください。']],
    journey: 'ひとつの思いから、次の冒険へ。',
    steps: [['旅のヒントを探す', '心に残る場所、風景、体験から始めましょう。'], ['ご希望を教えてください', '日程、人数、体験したいことをお聞かせください。'], ['一緒に詳しく計画する', 'ルートやペース、具体的な手配をチームと相談しましょう。']],
    invitation: '次の物語は、ここから。', invitationBody: '初めての訪問も、大好きな場所への再訪も。思い描く旅をお聞かせください。',
    reviews: 'お客様の声', previous: '前の口コミ', next: '次の口コミ', loading: '口コミを読み込み中…', empty: '私たちとの旅についてご質問がありますか？お気軽にお問い合わせください。',
  },
  kr: {
    intro: '새로운 나라를 발견하고, 사람을 만나고, 나만의 여행을 만들어 보세요.',
    landscape: '이식쿨 호숫가에서', yurt: '유목 생활에 한 걸음 더 가까이',
    story: '좋은 여행은 사람과의 만남에서 시작됩니다.', explore: '키르기스스탄으로 향하는 첫걸음',
    cards: [['마음에 드는 곳을 찾아보세요', '호수와 산골짜기, 천천히 머물고 싶은 곳들을 둘러보세요.'], ['모험을 위한 시간을 만드세요', '여행 일정을 살펴보고 관심사에 맞는 여행을 찾아보세요.'], ['조금 더 깊이 알아보세요', '출발 전에 여행 이야기와 실용적인 안내를 읽어보세요.']],
    journey: '하나의 생각에서 다음 모험까지.',
    steps: [['영감을 찾아보세요', '마음에 남는 장소, 풍경 또는 경험에서 시작하세요.'], ['계획을 알려주세요', '여행 날짜, 인원, 하고 싶은 활동을 공유해 주세요.'], ['함께 세부 사항을 정해요', '팀과 함께 경로, 여행 속도와 준비 사항을 의논하세요.']],
    invitation: '다음 이야기는 여기서 시작됩니다.', invitationBody: '첫 방문이든 좋아하는 곳으로의 귀환이든, 생각하시는 여행을 들려주세요.',
    reviews: '고객들의 이야기', previous: '이전 후기', next: '다음 후기', loading: '여행자 후기를 불러오는 중…', empty: '저희와 함께하는 여행에 궁금한 점이 있나요? 팀에 문의해 주세요.',
  },
}
