"""Содержимое сайта Disorder Game Studio: студия и проекты на русском и английском.

Тексты проектов собраны с их страниц на itch.io, из пресс-китов и описаний в исходниках. Картинки: ссылки на
itch.io или пути к файлам на диске — tools/media.py скачивает их и готовит размеры для сайта.
"""

# Адрес сайта: свой домен (файлы лежат на GitHub Pages). От него строятся canonical, hreflang, sitemap и Open Graph
SITE_URL = "https://disordergamestudio.ru"
# Коды подтверждения из Яндекс.Вебмастера и Google Search Console (вставить, когда сайт добавят туда)
YANDEX_VERIFICATION = "869046569c011d5a"
GOOGLE_VERIFICATION = ""
# Ключ IndexNow: build.py кладёт его в корень сайта файлом <ключ>.txt, tools/indexnow.py отправляет с ним
# новые и изменённые страницы в Яндекс. Ключ не секретный — поисковик сам скачивает этот файл для проверки
INDEXNOW_KEY = "46bb65e3888661ee18cdb21514bebac3"

STUDIO = {
    "name": "Disorder Game Studio",
    "short": "DGS",
    "founded": "2026",
    "country": "RU",
    "ru": {
        "tagline": "Мы геймеры и делаем игры и программы для геймеров",
        "bio": [
            "Disorder Game Studio — небольшая инди-студия из России. Мы сами геймеры и делаем то, во что хотели бы "
            "играть: сюжетные игры, стратегии, головоломки, игры для компании и программы, которые делают "
            "игровую жизнь удобнее.",
            "Почти всё, что мы сделали, можно попробовать бесплатно — прямо в браузере или скачав с itch.io и GitHub. "
            "Следите за новостями и пишите нам в Telegram и Discord: мы читаем всё.",
        ],
    },
    "en": {
        "tagline": "Made by gamers, for gamers",
        "bio": [
            "Disorder Game Studio is a small indie studio from Russia. We're gamers ourselves, and we make what we'd "
            "love to play: story-driven games, strategy, puzzles, party games and apps that make a gamer's life "
            "easier.",
            "Almost everything we've made is free to try, right in your browser or as a download from itch.io and "
            "GitHub. Follow us for news and say hi on Telegram and Discord — we read everything.",
        ],
    },
    "links": [
        {"id": "telegram", "label": "Telegram", "url": "https://t.me/disordergamestudio"},
        {"id": "discord", "label": "Discord", "url": "https://discord.gg/vTBJJTzXx"},
        {"id": "itch", "label": "itch.io", "url": "https://psihozkakblago.itch.io/"},
        {"id": "github", "label": "GitHub", "url": "https://github.com/qqvoodoo06-beep"},
        {"id": "dtf", "label": "DTF", "url": "https://dtf.ru/id3531314"},
    ],
}

# Порядок — как на главной. kind: game | app — от этого зависят подписи и разметка schema.org.
PROJECTS = [
    {
        "slug": "hoits",
        "kind": "game",
        "accent": "#e8613c",
        "badge": "soon",
        "platforms": ["Windows"],
        "engine": "s&box (Source 2)",
        "price": "—",
        "languages": ["ru", "en", "es"],
        "ru": {
            "title": "HoITS: антология допросов",
            "short_title": "HoITS",
            "tagline": "Пять допросов. Пять версий одной ночи. Мир меняется вслед за словами — а вы внутри него.",
            "seo_title": "HoITS: антология допросов — сюжетная игра о ненадёжном рассказчике",
            "seo_description": "HoITS — сюжетная игра от первого лица о пяти допросах: рассказчик меняет "
                               "показания, и мир переписывается на глазах. Игра готова, готовим релиз в Steam.",
            "genre": "Сюжетная антология от первого лица, психологическая драма",
            "status": "Игра готова · готовим релиз в Steam",
            "description": [
                "HoITS — антология из пяти коротких историй от первого лица. Кабинет, следователь, протокол. "
                "Человек рассказывает, как всё было, и вы оказываетесь внутри его версии. Вы играете не события, "
                "а показания.",
                "Стоит рассказчику поправить себя — и мир меняется прямо у вас на глазах: ворота захлопываются "
                "перед носом, пистолет исчезает из рук посреди перестрелки, у убитого задним числом появляется оружие. "
                "Где правда, игра так и не скажет — вы видите только то, что человек согласился сказать вслух.",
                "Четыре истории — о людях, которые раз за разом меняют свои показания: охраннике, часовом, "
                "двадцатидвухлетнем парне и слесаре ЖЭКа. Пятая — о том, кто много лет спустя откроет эти папки "
                "в чужом архиве. Первые четыре разворачиваются в советское время, пятая — в наши дни. И каждая "
                "заканчивается одним и тем же выбором: подписать протокол или нет.",
                "Игра закончена, сейчас мы готовим её выход в Steam отдельным приложением — аккаунт s&box не "
                "понадобится. Русская озвучка и субтитры, текст переведён на английский и испанский.",
            ],
            "features": [
                "Реткон как главная механика: рассказчик меняет показания, и уровень переписывается прямо во время "
                "игры, без кат-сцен и загрузок",
                "Пять историй — пять способов играть: перестрелка, один выстрел в трёх пересказах, вскрытие замка "
                "по штифтам, роль понятого и ночной поиск за компьютером",
                "Четыре следователя, и каждый ведёт допрос по-своему",
                "Правду игра не показывает: вы видите только ту версию, которую человек готов подписать",
                "Никакого интерфейса, только субтитры; смерть и перезапуск — часть рассказа",
                "Советский сеттинг в первых четырёх историях и финал в наши дни, связывающий все дела",
                "Русская озвучка, перевод текста на английский и испанский, 14 достижений",
            ],
            "keywords": ["HoITS", "HoITS Steam", "хойтс", "игра про допрос", "ненадёжный рассказчик", "сюжетная игра от первого лица",
                         "нарративная инди-игра", "игра в советском сеттинге", "игра на s&box"],
        },
        "en": {
            "title": "HoITS: An Anthology of Interrogations",
            "short_title": "HoITS",
            "tagline": "Five interrogations. Five versions of one night. The world rewrites itself to match the "
                       "words, and you are inside it.",
            "seo_title": "HoITS: An Anthology of Interrogations — first-person story game",
            "seo_description": "HoITS is a finished first-person story game about five interrogations where the "
                               "world rewrites itself to match the testimony. Steam release in preparation.",
            "genre": "First-person narrative anthology, psychological drama",
            "status": "Finished · Coming to Steam",
            "description": [
                "HoITS is a first-person anthology of five short stories. An interrogation room, an investigator, "
                "a written statement. A man tells the investigator how it all happened, and you step inside his "
                "version of events. You don't play through what happened. You play through the testimony.",
                "When the narrator corrects himself, the world changes to match, right in front of you. A gate swings shut in your "
                "face, the pistol vanishes from your hand mid-firefight, a dead man turns out to have been armed "
                "after all. The game never tells you what the truth is: all you get is what someone was willing to "
                "say out loud.",
                "Four of the stories follow people who keep editing their own statements: a security guard, a "
                "sentry, a 22-year-old and a building maintenance man. The fifth follows someone who, years later, "
                "opens those case files in a stranger's archive. The first four take place in the Soviet era, the "
                "fifth in the present day. Every story ends on the same choice: sign the statement, or don't.",
                "The game is finished and coming to Steam as a standalone release — no s&box account needed. "
                "Russian voice acting and subtitles, with English and Spanish text.",
            ],
            "features": [
                "Retcon as the core mechanic: when the narrator changes his testimony, the level rewrites itself in "
                "real time, with no cutscene or loading screen",
                "Five stories, five ways to play: a firefight, one shot told three times, lockpicking pin by pin, "
                "an official witness at an apartment search and a late-night hunt at a computer",
                "Four investigators, each running the interrogation their own way",
                "The game never reveals the truth: you only see the version someone was willing to sign",
                "No HUD, only subtitles; deaths and restarts are part of the story",
                "Soviet-era settings in the first four stories and a present-day finale that ties every case "
                "together",
                "Russian voice acting, English and Spanish text, 14 achievements",
            ],
            "keywords": ["HoITS", "HoITS Steam", "interrogation game", "unreliable narrator game", "first-person narrative game",
                         "story-driven indie game", "Soviet-era game", "s&box game"],
        },
        "links": [
            {"id": "telegram", "ru": "Следить за релизом в Telegram", "en": "Follow the release on Telegram",
             "url": "https://t.me/disordergamestudio", "primary": True},
            {"id": "dtf", "ru": "Анонс на DTF", "en": "Announcement on DTF (in Russian)",
             "url": "https://dtf.ru/indie/5271085-indi-igra-hoits-ot-disorder-game-studio"},
        ],
        "media": {
            "cover": {"src": "gen:hoits-cover"},
            "hero": {"src": r"D:\software\hoits\Steam\capsules\library_hero.png"},
            "logo": {"ru": r"D:\software\hoits\Steam\capsules\library_logo.png",
                     "en": r"D:\software\hoits\Steam\capsules\en\library_logo.png"},
            "video": {"src": r"D:\software\hoits\Steam\trailer.mp4", "poster_at": 2.0, "upload_date": "2026-09-09",
                      "ru": "Трейлер HoITS", "en": "HoITS trailer"},
            "shots": [
                {"src": r"D:\software\hoits\Steam\source\room_before.png",
                 "ru": "«Понятой»: обычная квартира во время обыска", "en": "“Attesting Witness”: an ordinary apartment during a search"},
                {"src": r"D:\software\hoits\Steam\source\room_after.png",
                 "ru": "Та же квартира, когда гаснет свет", "en": "The same apartment after the lights go out"},
                {"src": r"D:\software\hoits\Steam\shots\p2_gate_retcon_gate_open.png",
                 "ru": "«Ворота были открыты…»", "en": "“The gate was open…”"},
                {"src": r"D:\software\hoits\Steam\shots\p2_gate_retcon_gate_closed.png",
                 "ru": "…«нет, закрыты» — и ворота захлопываются", "en": "…“no, it was closed” — and it slams shut"},
                {"src": r"D:\software\hoits\Steam\screenshots\10_interrogation_sentry.png",
                 "ru": "Кабинет допроса: один стол и протокол", "en": "The interrogation room: one desk and a statement"},
                {"src": r"D:\software\hoits\Steam\screenshots\12_yard_1_unarmed.png",
                 "ru": "Тот же двор, тот же человек — и каждый пересказ его меняет",
                 "en": "Same yard, same man — and every retelling changes him"},
                {"src": r"D:\software\hoits\Steam\screenshots\07_roof_back.png",
                 "ru": "Крыша объекта ночью", "en": "The rooftop at night"},
                {"src": r"D:\software\hoits\Steam\screenshots\01_access_flat.png",
                 "ru": "«Доступ»: наши дни, половина третьего ночи, чужой архив",
                 "en": "“Access”: present day, 2:30 a.m., a stranger's archive"},
            ],
        },
    },
    {
        "slug": "god-of-bureaucracy",
        "kind": "game",
        "accent": "#c9a34a",
        "badge": "play",
        "platforms": ["Desktop browser"],
        "engine": "Python, pygame-ce",
        "price": "free",
        "languages": ["ru", "en"],
        "ru": {
            "title": "Бог бюрократии",
            "short_title": "Бог бюрократии",
            "tagline": "Ставьте печати на абсурдных бумагах, подписывайте чеки, кормите семью. А некоторые дела "
                       "придут за вами домой.",
            "seo_title": "Бог бюрократии — бесплатный симулятор бюрократа: играть в браузере",
            "seo_description": "«Бог бюрократии» — мрачная сатира и симулятор бумажной работы: печати, абсурдные "
                               "заявления, семейный бюджет и 10 концовок. Играть бесплатно в браузере.",
            "genre": "Симулятор бюрократа, сюжетный менеджмент",
            "status": "В разработке · версия 0.99.35",
            "description": [
                "Вы — Илья Редин, младший регистратор районного управления учёта № 7 в Узловске. Бумаги прилетают "
                "по пневмопочте, на стенде ждут пять печатей, а настенные часы отсчитывают смену. Сверьте номер "
                "дела, подпись и отметку копии с приказом дня, поставьте печать, закройте тубус и отправьте его "
                "в трубу. Потом распишитесь на чеке настоящим росчерком мыши.",
                "Большинство бумаг — чистый канцелярский абсурд: заявление на эксплуатацию стула, разрешение на "
                "содержание голубя, уведомление о получении уведомления. С 24 сюжетными делами всё серьёзнее: они "
                "решают, где людям жить и работать, а ваши решения возвращаются через несколько дней — иногда "
                "прямо к вашему порогу.",
                "Вечером дома ждут жена, дочь и мать. Скромную зарплату нужно растянуть на еду, квартиру, отопление "
                "и лекарства. Тридцать рабочих дней закончатся одним из десяти исходов, а эпилог расскажет о судьбе "
                "семьи и тех, чьи дела прошли через ваш стол.",
                "Играть можно бесплатно прямо в браузере, на русском или английском. Игра ещё в разработке, но "
                "уже проходится от первого дня до тридцатого.",
            ],
            "features": [
                "Рабочее место, где всё делается руками: пневмотрубы, тубусы, лупа, служебная книга и пять печатей",
                "Подписи, которые вы выводите мышью сами",
                "24 правила, которые открываются по ходу месяца",
                "24 сюжетных дела с отложенными последствиями, 10 концовок и эпилог",
                "Домашний бюджет: еда, квартира, отопление, лекарства и угроза выселения",
                "Карьера: восемь аттестаций и пять должностей",
                "Играется одной мышью, сохраняется сама, работает в браузере без установки",
            ],
            "keywords": ["Бог бюрократии", "симулятор бюрократа", "игра про бюрократию", "игра про печати",
                         "игра как Papers Please", "браузерная игра бесплатно", "сатира"],
        },
        "en": {
            "title": "The God of Bureaucracy",
            "short_title": "The God of Bureaucracy",
            "tagline": "Stamp absurd papers, sign the slips, feed the family. Some of the cases follow you home.",
            "seo_title": "The God of Bureaucracy — free paperwork simulator in your browser",
            "seo_description": "The God of Bureaucracy is a dark satirical paperwork sim: stamps, absurd forms, a "
                               "family budget and 10 endings. Free in your browser, in English or Russian.",
            "genre": "Paperwork simulation, narrative management",
            "status": "In development · v0.99.35",
            "description": [
                "You are Ilya Redin, a junior registrar at District Records Office No. 7 in the town of Uzlovsk. "
                "Papers arrive by pneumatic post, five stamps wait on their stand, and the wall clock counts down "
                "your shift. Check the case number, the signature and the copy mark against the order of the day, "
                "stamp your decision, seal the canister and send it up the pipe. Then sign the slip with a real "
                "stroke of the mouse.",
                "Most of the paperwork is gloriously absurd: an application for chair operation, a permit for "
                "keeping a pigeon, a notice of receipt of a notice. The 24 story cases are a different matter: "
                "they decide where people live and work, and your decisions come back days later — sometimes to "
                "your own front door.",
                "Evenings belong to the family: your wife, your daughter and your mother. Stretch a tight wage over "
                "food, rent, heating and medicine. Thirty working days end in one of ten outcomes, followed by an "
                "epilogue about your family and the people whose cases crossed your desk.",
                "Free to play right in your browser, in English or Russian. The game is still in development, but "
                "you can already play from day one to day thirty.",
            ],
            "features": [
                "A desk you work with your hands: pneumatic pipes, canisters, a magnifying glass, a ledger and five "
                "stamps",
                "Signatures you draw yourself with the mouse",
                "24 rules unlocked over the month",
                "24 story cases with delayed consequences, 10 endings and an epilogue",
                "A household budget: food, rent, heating, medicine and the threat of eviction",
                "A career ladder: eight performance reviews and five positions",
                "Mouse-only, saves automatically, runs in the browser with nothing to install",
            ],
            "keywords": ["The God of Bureaucracy", "paperwork simulator", "bureaucracy game",
                         "stamp papers game", "game like Papers Please", "free browser game", "satire game"],
        },
        "links": [
            {"id": "itch", "ru": "Играть в браузере", "en": "Play in your browser",
             "url": "https://psihozkakblago.itch.io/the-god-of-bureaucracy", "primary": True},
        ],
        "note": {
            "ru": "Для компьютера с мышью. Первый запуск занимает 10–30 секунд, пока браузер загружает игру.",
            "en": "For a computer with a mouse. The first launch takes 10–30 seconds while your browser loads the "
                  "game.",
        },
        "media": {
            "cover": {"src": r"G:\D\Новая папка\Bureaucracy_Pygame\packaging\itch\cover_1260x1000.png"},
            "hero": {"src": "https://img.itch.zone/aW1nLzMwNjQzNDY1LnBuZw==/original/89Ycyf.png"},
            "shots": [
                {"src": "https://img.itch.zone/aW1hZ2UvNTExODI4Ny8zMDY0MjY3Ny5wbmc=/original/BljUUf.png", "lang": "en",
                 "ru": "Смена в разгаре", "en": "A shift in full swing"},
                {"src": r"G:\D\Новая папка\Bureaucracy_Pygame\packaging\itch\screenshots\ru\01_desk.png", "lang": "ru",
                 "ru": "Рабочий стол посреди смены", "en": "The desk mid-shift"},
                {"src": "https://img.itch.zone/aW1hZ2UvNTExODI4Ny8zMDY0MjY4MC5wbmc=/original/qEdwM9.png", "lang": "en",
                 "ru": "Под лупой время стоит", "en": "The clock stops while you use the magnifying glass"},
                {"src": r"G:\D\Новая папка\Bureaucracy_Pygame\packaging\itch\screenshots\ru\05_order.png", "lang": "ru",
                 "ru": "Приказ на день: норма, длина смены и новое правило",
                 "en": "The order of the day: quota, shift length and a new rule"},
                {"src": "https://img.itch.zone/aW1hZ2UvNTExODI4Ny8zMDY0MjY4NC5wbmc=/original/%2BCz5EG.png",
                 "lang": "en", "ru": "Сюжетное дело: три решения, у каждого своя цена",
                 "en": "A story case: three decisions, each with its own price"},
                {"src": r"G:\D\Новая папка\Bureaucracy_Pygame\packaging\itch\screenshots\en\04_home.png", "lang": "en",
                 "ru": "Вечер дома", "en": "An evening at home"},
                {"src": r"G:\D\Новая папка\Bureaucracy_Pygame\packaging\itch\screenshots\ru\04_home.png", "lang": "ru",
                 "ru": "Вечер дома: еда, квартира, отопление, лекарства",
                 "en": "An evening at home: food, rent, heating, medicine"},
            ],
        },
    },
    {
        "slug": "gameshelf",
        "kind": "app",
        "accent": "#a78bfa",
        "badge": "free",
        "platforms": ["Windows"],
        "engine": "Python, PySide6 (Qt)",
        "price": "free",
        "languages": ["ru", "en"],
        "version": "0.3.1",
        "ru": {
            "title": "GameShelf",
            "short_title": "GameShelf",
            "tagline": "Бесплатный трекер игр для Windows: библиотека, учёт времени и плашки о достижениях прямо "
                       "поверх игры.",
            "seo_title": "GameShelf — бесплатный трекер игр для Windows с оверлеем достижений",
            "seo_description": "GameShelf — бесплатный трекер игр для Windows: библиотека со статусами, "
                               "автоматический учёт времени, статистика и достижения Steam с оверлеем в игре.",
            "genre": "Трекер игр, программа для геймеров",
            "status": "Вышла · версия 0.3.1",
            "description": [
                "GameShelf собирает все ваши игры в одну библиотеку и честно считает, сколько вы в них играете. "
                "Статусы «Играю», «В планах», «Пройдено», «Отложено» и «Брошено», оценка, часы и заметки к каждой "
                "игре. Поиск по каталогу Steam — без регистрации и ключей.",
                "Время считается само: игры из Steam, Epic Games и GOG находятся на компьютере автоматически, а для "
                "любой другой достаточно указать её .exe или перетащить файл в окно. В статистике — часы по неделям, "
                "самый долгий сеанс и любимые жанры.",
                "Достижения из Steam и из сборок с эмуляторами Steam показываются с настоящими названиями, иконками "
                "и редкостью, а новое достижение всплывает плашкой прямо поверх игры. В игру ничего не внедряется, "
                "так что античитам нечего замечать.",
                "Программа бесплатная, с открытым кодом (MIT), на русском и английском. Данные хранятся только на "
                "вашем компьютере.",
            ],
            "features": [
                "Библиотека со статусами, оценками, часами и заметками",
                "Поиск по каталогу Steam без аккаунта и ключей",
                "Автоматический учёт времени для Steam, Epic Games, GOG и любых других игр",
                "Статистика: часы по неделям, самый долгий сеанс, игра месяца",
                "Достижения Steam и сборок с эмуляторами; плашка поверх игры в оконном и безрамочном режиме",
                "20 своих достижений GameShelf за библиотеку и привычки",
                "Открытый код, без серверов и телеметрии, русский и английский интерфейс",
            ],
            "keywords": ["GameShelf", "трекер игр", "учёт времени в играх", "сколько часов в играх",
                         "оверлей достижений", "достижения Steam", "программа для геймеров"],
        },
        "en": {
            "title": "GameShelf",
            "short_title": "GameShelf",
            "tagline": "A free game tracker for Windows: your library, playtime and achievement popups right over "
                       "your games.",
            "seo_title": "GameShelf — free Windows game tracker with achievement overlay",
            "seo_description": "GameShelf is a free, open-source game tracker for Windows: a library with "
                               "statuses, automatic playtime tracking, stats and achievement popups over your games.",
            "genre": "Game tracker, utility for gamers",
            "status": "Released · v0.3.1",
            "description": [
                "GameShelf gathers all your games in one library and keeps an honest count of how long you play. Statuses "
                "(Playing, Planned, Completed, On hold, Dropped), a rating, hours and notes for every game. Search "
                "the Steam catalog with no account or API key.",
                "Playtime tracks itself: Steam, Epic Games and GOG games are found automatically, and for "
                "anything else you just pick its .exe or drag the file into the window. Statistics show hours by "
                "week, your longest session and favorite genres.",
                "Achievements from Steam and from Steam emulator builds come with real names, icons and rarity, and "
                "a new one pops up right over the game. Nothing is injected into the game, so there's "
                "nothing for anti-cheat to flag.",
                "Free and open source (MIT), in English and Russian. Your data stays on your computer.",
            ],
            "features": [
                "A library with statuses, ratings, hours and notes",
                "Steam catalog search with no account or API key",
                "Automatic playtime tracking for Steam, Epic Games, GOG and any other game",
                "Statistics: hours by week, longest session, game of the month",
                "Steam and emulator-build achievements, with a popup over windowed and borderless games",
                "20 built-in GameShelf achievements for your library and play habits",
                "Open source, no servers, no telemetry, English and Russian",
            ],
            "keywords": ["GameShelf", "game tracker", "playtime tracker", "track hours played",
                         "achievement overlay", "Steam achievements", "app for gamers"],
        },
        "links": [
            {"id": "download", "ru": "Скачать для Windows", "en": "Download for Windows",
             "url": "https://github.com/qqvoodoo06-beep/GameShelf/releases/latest", "primary": True},
            {"id": "itch", "ru": "Страница на itch.io", "en": "itch.io page",
             "url": "https://psihozkakblago.itch.io/gameshelf"},
            {"id": "github", "ru": "Исходный код на GitHub", "en": "Source code on GitHub",
             "url": "https://github.com/qqvoodoo06-beep/GameShelf"},
        ],
        "media": {
            "cover": {"src": r"G:\D\Новая папка\GameShelf\itch\cover.png"},
            "hero": {"src": r"G:\D\Новая папка\GameShelf\docs\screenshots\library.png"},
            "video": {"src": r"G:\D\Новая папка\GameShelf\itch\overlay.gif", "loop": True,
                      "ru": "Плашка о новом достижении поверх игры", "en": "A new achievement popping up over the game"},
            "shots": [
                {"src": r"G:\D\Новая папка\GameShelf\docs\screenshots\library-ru.png", "lang": "ru",
                 "ru": "Библиотека со статусами и часами", "en": "The library with statuses and hours"},
                {"src": r"G:\D\Новая папка\GameShelf\docs\screenshots\library.png", "lang": "en",
                 "ru": "Библиотека со статусами и часами", "en": "The library with statuses and hours"},
                {"src": r"G:\D\Новая папка\GameShelf\docs\screenshots\details-ru.png", "lang": "ru",
                 "ru": "Окно игры: статус, оценка, часы и достижения", "en": "The game window"},
                {"src": r"G:\D\Новая папка\GameShelf\docs\screenshots\details.png", "lang": "en",
                 "ru": "Окно игры", "en": "The game window: status, rating, hours and achievements"},
                {"src": r"G:\D\Новая папка\GameShelf\docs\screenshots\achievements-ru.png", "lang": "ru",
                 "ru": "Свои достижения GameShelf", "en": "GameShelf achievements"},
                {"src": r"G:\D\Новая папка\GameShelf\docs\screenshots\achievements.png", "lang": "en",
                 "ru": "Свои достижения GameShelf", "en": "GameShelf's own achievements"},
                {"src": r"G:\D\Новая папка\GameShelf\docs\screenshots\stats-ru.png", "lang": "ru",
                 "ru": "Статистика: часы по неделям и рекорды", "en": "Statistics"},
                {"src": r"G:\D\Новая папка\GameShelf\docs\screenshots\stats.png", "lang": "en",
                 "ru": "Статистика", "en": "Statistics: hours by week and records"},
            ],
        },
    },
    {
        "slug": "music-lotto",
        "kind": "game",
        "accent": "#4fd1c5",
        "badge": "play",
        "platforms": ["Browser", "Mobile"],
        "engine": "Node.js, HTML5",
        "price": "free",
        "languages": ["ru"],
        "ru": {
            "title": "Музыкальное лото",
            "short_title": "Музыкальное лото",
            "tagline": "Лото, где вместо бочонков звучат песни: ведущий включает отрывки, гости закрывают клетки "
                       "прямо с телефонов.",
            "seo_title": "Музыкальное лото онлайн — бесплатная игра для вечеринки на телефонах",
            "seo_description": "Музыкальное лото онлайн: ведущий включает отрывки песен, гости угадывают их и "
                               "закрывают клетки на карточках с телефонов. Бесплатно, без регистрации.",
            "genre": "Игра для компании, музыкальная викторина",
            "status": "Работает онлайн · бесплатно",
            "description": [
                "«Музыкальное лото» — браузерная игра для компании. Ведущий открывает пульт, собирает плейлист и "
                "раздаёт гостям код комнаты или QR-код. Игроки заходят с телефонов, ничего не устанавливают и не "
                "регистрируются, и каждый получает свою карточку с названиями песен.",
                "Дальше всё как в настоящем лото, только вместо бочонков звучит музыка. Ведущий запускает отрывок, "
                "игроки узнают песню и закрывают клетку. Собрал линию, две линии или всё поле — победил. За быстрый "
                "ответ дают очки, за промах их снимают, так что тыкать наугад невыгодно.",
                "Музыку можно взять из плейлиста YouTube или сета SoundCloud. Есть и ручной режим: "
                "приложение тасует треки и следит за временем, а песни вы включаете сами — хоть с винила, хоть "
                "живьём. Отрывок звучит у каждого игрока, поэтому играть можно и за одним столом, и на расстоянии.",
            ],
            "features": [
                "Вход по коду комнаты или QR-коду с любого телефона, без установки и регистрации",
                "Музыка из YouTube и SoundCloud или ручной режим, где песни включаете вы сами",
                "Карточки от 3×3 до 6×6, свободный центр и диагонали по желанию",
                "Победа за любую линию, две линии или всё поле",
                "Очки за скорость и штраф за промах — тыкать наугад невыгодно",
                "Играть можно и в одной комнате, и на расстоянии",
                "Название песни игроки видят, только когда ведущий его откроет, а сервер проверяет каждую отметку — "
                "сжульничать не выйдет",
            ],
            "keywords": ["музыкальное лото", "музыкальное лото онлайн", "музыкальное бинго",
                         "угадай мелодию онлайн", "игра для вечеринки", "игра для компании на телефонах"],
        },
        "en": {
            "title": "Music Lotto",
            "short_title": "Music Lotto",
            "tagline": "Music bingo for any get-together: the host plays song snippets, guests mark their cards "
                       "right on their phones.",
            "seo_title": "Music Lotto — free online music bingo party game (Russian UI)",
            "seo_description": "Music Lotto is a free browser music bingo: the host plays song snippets, guests "
                               "mark their cards on their phones. No install, no sign-up. Russian interface.",
            "genre": "Party game, music quiz",
            "status": "Live online · free (interface in Russian)",
            "description": [
                "Music Lotto is a browser party game that turns classic lotto into a guess-the-song challenge. The "
                "host opens a control panel, loads a playlist and shares a room code or a QR code. Guests join from "
                "their phones with nothing to install and no sign-up, and each gets a personal card of song titles.",
                "From there it plays like real lotto, except the numbers are songs. A snippet starts, players "
                "recognize the track and tap the matching square. Complete a line, two lines or the whole card to "
                "win. Fast answers earn points and wrong taps cost them, so random guessing doesn't pay.",
                "Music can come from YouTube playlists or SoundCloud sets. There's also a manual "
                "mode: the app shuffles the tracks and keeps time while you play the songs yourself. The snippet "
                "plays on every player's device, so you can play around one table or far apart. The interface is "
                "in Russian for now.",
            ],
            "features": [
                "Join with a room code or QR code from any phone: no install, no sign-up",
                "Music from YouTube or SoundCloud, or play the songs yourself in manual mode",
                "Cards from 3×3 to 6×6, with an optional free center and diagonals",
                "Win with any line, two lines or a full card",
                "Points for speed and penalties for misses, so random guessing doesn't pay",
                "Play in one room or remotely",
                "Song titles stay hidden until the host reveals them, and the server checks every mark, so there's "
                "no cheating",
            ],
            "keywords": ["music lotto", "music bingo", "online music bingo", "guess the song game",
                         "party game on phones", "browser party game"],
        },
        "links": [
            {"id": "play", "ru": "Играть онлайн", "en": "Play online", "url": "https://musloto.onrender.com/",
             "primary": True},
            {"id": "host", "ru": "Пульт ведущего", "en": "Host console", "url": "https://musloto.onrender.com/host"},
            {"id": "dtf", "ru": "Статья об игре на DTF", "en": "Article on DTF (in Russian)",
             "url": "https://dtf.ru/indie/5273368-muzykalnoe-loto-ot-disorder-game-studio"},
        ],
        "note": {
            "ru": "Сервер бесплатный и засыпает без игроков: если страница не открылась сразу, подождите около минуты.",
            "en": "The free server sleeps when nobody plays: if the page doesn't open right away, give it up to a "
                  "minute.",
        },
        "media": {
            "cover": {"src": "gen:music-lotto-cover"},
            "hero": {"src": r"G:\D\Новая папка\DisorderGameStudio-site\assets-src\music-lotto\host-desktop.png"},
            "shots": [
                {"src": r"G:\D\Новая папка\DisorderGameStudio-site\assets-src\music-lotto\host-desktop.png",
                 "ru": "Пульт ведущего: плейлист, правила и код комнаты",
                 "en": "The host console: playlist, rules and room code"},
                {"src": r"G:\D\Новая папка\DisorderGameStudio-site\assets-src\music-lotto\player-desktop.png",
                 "ru": "Вход для игроков: код комнаты и имя", "en": "Players join with a room code and a name"},
            ],
        },
    },
    {
        "slug": "uprising-lands-of-the-red",
        "kind": "game",
        "accent": "#e0453f",
        "badge": "free",
        "platforms": ["Windows"],
        "engine": "Python, pygame",
        "price": "free",
        "languages": ["ru", "en"],
        "ru": {
            "title": "Восстание: Земли Красных",
            "short_title": "Восстание",
            "tagline": "Поднимите восстание с пепелища и верните земли Красных Кланов. Сюжетная RTS, где за каждое "
                       "решение придётся платить.",
            "seo_title": "Восстание: Земли Красных (Uprising: Lands of the Red) — RTS",
            "seo_description": "«Восстание: Земли Красных» (Uprising: Lands of the Red) — бесплатная RTS для "
                               "Windows: кампания из 7 глав, экономика на рабочих, герои и решения с последствиями.",
            "genre": "Стратегия в реальном времени с сюжетной кампанией",
            "status": "Ранняя версия 0.7.7 · бесплатно",
            "description": [
                "«Восстание: Земли Красных» (Uprising: Lands of the Red) — бесплатная стратегия в реальном времени "
                "для Windows. Синяя Империя забрала земли Красных Кланов и почти утопила восстание в крови. Вы — "
                "последний уцелевший командир: начинать придётся с пепелища разгромленного лагеря, а дойти нужно "
                "до штурма имперской крепости.",
                "Кампания из семи глав постоянно меняет правила: война экономик, поход с автономными союзниками, "
                "зачистка леса отрядом из пяти бойцов без единой постройки и две главы вовсе без сражений — только "
                "разговоры у костра и решения, которые ещё аукнутся.",
                "Ни одно здание не встанет без рабочего. Возводите казармы, шахты, стены и башни, бросайте "
                "копейщиков против рыцарей и ломайте укрепления катапультами. У каждого из трёх героев своя "
                "способность, а ИИ-противник развивает экономику и подстраивает армию под ваши войска.",
            ],
            "features": [
                "Сюжетная кампания из семи глав с разными типами миссий",
                "Решения с последствиями: выбор на военном совете меняет штурм гарнизона",
                "Экономика на рабочих: казармы, шахты, стены с воротами, башни, осадный двор",
                "Контрюниты: копейщики, рыцари, лучники, лекари, маги и катапульты",
                "Три героя с активными способностями",
                "ИИ, который строит экономику, ходит в рейды и отводит раненых",
                "Туман войны, три уровня сложности, обучение, русский и английский",
            ],
            "keywords": ["Восстание Земли Красных", "Uprising Lands of the Red", "стратегия в реальном времени",
                         "RTS бесплатно", "сюжетная стратегия", "стратегия с постройкой базы"],
        },
        "en": {
            "title": "Uprising: Lands of the Red",
            "short_title": "Uprising",
            "tagline": "Rebuild the revolt from the ashes and take back the lands of the Red Clans: a story-driven "
                       "RTS where your choices come back to you.",
            "seo_title": "Uprising: Lands of the Red — free story-driven real-time strategy",
            "seo_description": "Uprising: Lands of the Red is a free RTS for Windows: a 7-chapter campaign, a "
                               "worker-driven economy, heroes and choices with consequences.",
            "genre": "Real-time strategy with a story campaign",
            "status": "Early version 0.7.7 · free",
            "description": [
                "Uprising: Lands of the Red is a free real-time strategy game for Windows. The Blue Empire has "
                "seized the lands of the Red Clans and all but drowned the revolt in blood. You are the last "
                "surviving commander: start from the ashes of a burned-out camp and fight your way up to storming "
                "an imperial fortress.",
                "The seven-chapter campaign keeps changing the rules: economy-versus-economy warfare, a march with "
                "autonomous allies, a forest sweep with a five-strong squad and no buildings at all, and two chapters "
                "without a single battle — just campfire conversations and decisions that come back later.",
                "Every building starts with a worker. Raise barracks, mines, walls and towers, counter knights with "
                "spearmen and break fortifications with catapults. Each of the three heroes has an active ability, "
                "and the AI grows its own economy and adapts its army to yours.",
            ],
            "features": [
                "A seven-chapter story campaign with varied mission types",
                "Choices with consequences: what you decide at the war council changes the assault on the garrison",
                "A worker-driven economy: barracks, mines, gated walls, towers and siege works",
                "Unit counters: spearmen, knights, archers, healers, mages and catapults",
                "Three heroes with active abilities",
                "An AI that builds an economy, raids your mines and pulls back its wounded",
                "Fog of war, three difficulty levels, a tutorial, English and Russian",
            ],
            "keywords": ["Uprising Lands of the Red", "real-time strategy game", "free RTS", "indie RTS",
                         "story-driven RTS", "base building strategy"],
        },
        "links": [
            {"id": "itch", "ru": "Скачать на itch.io", "en": "Download on itch.io",
             "url": "https://psihozkakblago.itch.io/redvsblue", "primary": True},
            {"id": "devlog", "ru": "Дневник разработки", "en": "Devlog",
             "url": "https://psihozkakblago.itch.io/redvsblue/devlog"},
        ],
        "media": {
            "cover": {"src": "https://img.itch.zone/aW1nLzI4OTE5NjY5LnBuZw==/original/359s0z.png"},
            "hero": {"src": "https://img.itch.zone/aW1hZ2UvNDgzNzc3OS8yODkwODQ1OC5qcGc=/original/OBidq7.jpg"},
            "shots": [
                {"src": "https://img.itch.zone/aW1hZ2UvNDgzNzc3OS8yODkxODk3MS5wbmc=/original/t%2FIvJi.png",
                 "ru": "Глава 1 «Пепел мятежа»: растущая база", "en": "Chapter 1, “Ashes of the Revolt”: a growing base"},
                {"src": "https://img.itch.zone/aW1hZ2UvNDgzNzc3OS8yODkwODQ1OC5qcGc=/original/OBidq7.jpg",
                 "ru": "Укреплённая база: стены, башня, катапульты и рыцари",
                 "en": "A fortified base: walls, a tower, catapults and knights"},
                {"src": "https://img.itch.zone/aW1hZ2UvNDgzNzc3OS8yODkwODQ2MC5qcGc=/original/Ibq4pr.jpg",
                 "ru": "Главное меню и выбор сложности", "en": "The main menu and difficulty choice"},
                {"src": "https://img.itch.zone/aW1nLzI4OTIxNTk5LnBuZw==/original/4FibiW.png",
                 "ru": "Сторожевая башня Синей Империи: новая графика построек", "en": "A Blue Empire watchtower: new building art"},
            ],
        },
    },
    {
        "slug": "tidying-the-puzzle-gallery",
        "kind": "game",
        "accent": "#f4a259",
        "badge": "play",
        "platforms": ["Desktop browser"],
        "engine": "Three.js (WebGL)",
        "price": "free",
        "languages": ["ru", "en"],
        "ru": {
            "title": "Уборка в галерее пазлов",
            "short_title": "Галерея пазлов",
            "tagline": "Ночью волки разгромили галерею. Собрать её заново предстоит лису.",
            "seo_title": "Уборка в галерее пазлов (Tidying the Puzzle Gallery) — 3D-пазл",
            "seo_description": "«Уборка в галерее пазлов» (Tidying the Puzzle Gallery) — спокойный 3D-пазл от "
                               "первого лица: шесть залов, свои фото вместо картин. Бесплатно в браузере.",
            "genre": "Уютный 3D-пазл от первого лица",
            "status": "Вышла · бесплатно",
            "description": [
                "Этой ночью глупые волки ворвались в галерею и устроили погром. Все картины рассыпались на кусочки, "
                "и теперь они раскиданы по шести залам. Хозяева позвали на помощь умного лиса — то есть вас. "
                "«Уборка в галерее пазлов» (Tidying the Puzzle Gallery) — спокойный пазл от первого лица, в который "
                "играют прямо в браузере: без проигрышей и гонки со временем, никто за вами не гонится.",
                "Ходите по залам и собирайте кусочки с пола и скамеек. Каждый лежит развёрнутым: крутите его, пока "
                "замки не сойдутся с ячейкой, а полупрозрачный контур подскажет, как он ляжет. На холсте остаётся "
                "бледный призрак картины — чем выше сложность, тем он незаметнее.",
                "Выберите смену на 24, 54 или 96 кусочков, отключите повороты или загрузите свои фотографии вместо "
                "картин. Картины, музыка и текстуры генерируются кодом, поэтому игра очень лёгкая и идёт даже на "
                "слабых компьютерах.",
            ],
            "features": [
                "Спокойный пазл от первого лица: без проигрышей и гонки со временем",
                "Шесть залов галереи, которые нужно привести в порядок",
                "Смены на 24, 54 или 96 кусочков",
                "Можно загрузить свои фотографии — они станут картинами",
                "Повороты кусочков, подсказка и осмотр вблизи",
                "Лёгкая игра, которая идёт даже на слабом компьютере",
                "Русский и английский, бесплатно в браузере",
            ],
            "keywords": ["Уборка в галерее пазлов", "Tidying the Puzzle Gallery", "пазл от первого лица",
                         "3D пазл в браузере", "пазлы онлайн бесплатно", "пазл из своих фотографий"],
        },
        "en": {
            "title": "Tidying the Puzzle Gallery",
            "short_title": "Puzzle Gallery",
            "tagline": "Wolves wrecked the gallery overnight. You are the fox who puts it back together.",
            "seo_title": "Tidying the Puzzle Gallery — cozy 3D jigsaw in your browser",
            "seo_description": "Tidying the Puzzle Gallery is a calm first-person 3D jigsaw: restore paintings "
                               "across six halls, or use your own photos. Free to play in your browser.",
            "genre": "Cozy first-person 3D jigsaw",
            "status": "Released · free",
            "description": [
                "Foolish wolves broke into the gallery last night and wrecked it. Every painting fell apart into "
                "jigsaw pieces, now scattered across six halls. The owners have called in a clever fox — that's "
                "you. Tidying the Puzzle Gallery is a calm first-person jigsaw you play right in your browser: no "
                "timer pressure, no fail state, nothing chasing you.",
                "Walk the halls and pick pieces up off the floor and benches. Every piece starts turned at random, "
                "so rotate it until the tabs match the slot; a translucent outline shows how it will sit. Each "
                "canvas keeps a faint ghost of its painting, and it fades as the difficulty goes up.",
                "Pick a shift of 24, 54 or 96 pieces, switch rotation off, or load your own photos as the "
                "paintings. The paintings, music and textures are all generated in code, so the game is very light and runs "
                "well even on weak computers.",
            ],
            "features": [
                "A calm first-person jigsaw with no fail state and no timer pressure",
                "Six gallery halls to put back in order",
                "Shifts of 24, 54 or 96 pieces",
                "Load your own photos and they become the paintings",
                "Piece rotation, a placement hint and close-up inspection",
                "Lightweight: runs well even on a weak computer",
                "English and Russian, free in your browser",
            ],
            "keywords": ["Tidying the Puzzle Gallery", "first-person jigsaw puzzle", "3D jigsaw browser game",
                         "free online jigsaw puzzle", "cozy puzzle game", "jigsaw with your own photos"],
        },
        "links": [
            {"id": "itch", "ru": "Играть в браузере", "en": "Play in your browser",
             "url": "https://psihozkakblago.itch.io/tidying-the-puzzle-gallery", "primary": True},
        ],
        "note": {
            "ru": "Нужны клавиатура и мышь — на телефоне не играется.",
            "en": "Needs a keyboard and mouse, so it isn't playable on phones.",
        },
        "media": {
            "cover": {"src": "https://img.itch.zone/aW1nLzI5NDg4MzYyLnBuZw==/original/27CdoG.png"},
            "hero": {"src": "https://img.itch.zone/aW1hZ2UvNDkzMDU3OS8yOTQ4ODQwMS5wbmc=/original/G3HSYg.png"},
            "shots": [
                {"src": "https://img.itch.zone/aW1hZ2UvNDkzMDU3OS8yOTQ4ODQwMS5wbmc=/original/G3HSYg.png",
                 "ru": "Дальний зал: кусочки рассыпаны по ковру", "en": "The far hall: pieces scattered over the rug"},
                {"src": "https://img.itch.zone/aW1hZ2UvNDkzMDU3OS8yOTQ4ODQwNS5wbmc=/original/MV6mML.png",
                 "ru": "Большой зал: наведите прицел на кусочек, чтобы поднять его",
                 "en": "The great hall: aim at a piece to pick it up"},
            ],
        },
    },
    {
        "slug": "pentomino",
        "kind": "game",
        "accent": "#38d9f5",
        "badge": "play",
        "platforms": ["Browser", "Mobile"],
        "engine": "JavaScript, HTML5 Canvas",
        "price": "free",
        "languages": ["ru", "en"],
        "ru": {
            "title": "Пентамино",
            "short_title": "Пентамино",
            "tagline": "Неоновая головоломка: падающие фигуры из пяти клеток. В браузере и на телефоне.",
            "seo_title": "Пентамино — неоновая головоломка: играть онлайн бесплатно",
            "seo_description": "«Пентамино» — неоновая головоломка с падающими фигурами из пяти клеток: три "
                               "режима, все 12 фигур, игра на телефоне и компьютере. Бесплатно в браузере.",
            "genre": "Головоломка с падающими фигурами",
            "status": "Вышла · бесплатно",
            "description": [
                "«Пентамино» — знакомая механика падающих фигур, только в каждой фигуре на одну клетку больше. Пять "
                "клеток вместо четырёх — это больше форм, неудобных силуэтов и поводов подумать, прежде чем "
                "положить фигуру. А азарт «ещё одной партии» никуда не делся.",
                "«Обычный» режим смешивает фигуры из четырёх и пяти клеток — самый мягкий вход. «Пентамино» "
                "оставляет только пятиклеточные фигуры, подобранные так, чтобы хорошо ложиться. «Все 12 фигур» "
                "выдаёт полный набор вместе с коварным «плюсиком».",
                "Есть карман для отложенной фигуры, показ следующих, подсветка места приземления и зеркальное "
                "отражение. Игра светится неоном и одинаково удобна на телефоне — касания и свайпы прямо по "
                "полю — и на компьютере.",
            ],
            "features": [
                "Три режима: «Обычный», «Пентамино» и «Все 12 фигур»",
                "Все 12 фигур пентамино и зеркальное отражение",
                "Карман, показ следующих фигур и подсветка приземления",
                "Управление касаниями и свайпами на телефоне, клавиатура на компьютере",
                "Неоновая графика, комбо и рост скорости по уровням",
                "Личный рекорд сохраняется",
                "Русский и английский, бесплатно в браузере",
            ],
            "keywords": ["пентамино", "пентамино онлайн", "пентамино играть бесплатно", "головоломка с фигурами",
                         "падающие фигуры", "неоновая головоломка"],
        },
        "en": {
            "title": "Pentomino",
            "short_title": "Pentomino",
            "tagline": "A neon falling-block puzzle where every piece has five cells. In your browser and on your "
                       "phone.",
            "seo_title": "Pentomino — free neon falling-block puzzle, play online",
            "seo_description": "Pentomino is a neon falling-block puzzle with five-cell pieces: three modes, all "
                               "12 pentominoes, phone and desktop controls. Free to play in your browser.",
            "genre": "Falling-block puzzle",
            "status": "Released · free",
            "description": [
                "Pentomino takes the familiar falling-block formula and gives every piece one extra cell. Five "
                "squares instead of four means more shapes, stranger silhouettes and placements that make you think "
                "twice, while keeping that quick “just one more game” rhythm.",
                "Standard mode mixes four- and five-cell pieces for a gentle start. Pentomino mode deals only "
                "five-cell shapes chosen to fit together well. “All 12 pieces” mode throws in the full set, "
                "including the notorious plus.",
                "A hold slot, upcoming pieces, a landing outline and a mirror move keep things fair. It glows in "
                "neon and plays just as well on a phone (tap and swipe right on the field) as on a computer.",
            ],
            "features": [
                "Three modes: Standard, Pentomino and All 12 pieces",
                "All 12 pentominoes, plus a mirror move",
                "Hold slot, upcoming pieces and a landing outline",
                "Touch and swipe controls on phones, keyboard on desktop",
                "Neon visuals, combos and levels that speed up",
                "Your personal best is saved",
                "English and Russian, free in your browser",
            ],
            "keywords": ["pentomino game", "pentomino puzzle online", "play pentomino free", "falling blocks puzzle",
                         "neon puzzle game", "mobile puzzle game"],
        },
        "links": [
            {"id": "itch", "ru": "Играть в браузере", "en": "Play in your browser",
             "url": "https://psihozkakblago.itch.io/pentomino", "primary": True},
        ],
        "media": {
            "cover": {"src": "https://img.itch.zone/aW1nLzI5ODE4ODA0LnBuZw==/original/LvV79%2F.png"},
            "hero": {"src": "https://img.itch.zone/aW1nLzI5ODE4ODA0LnBuZw==/original/LvV79%2F.png"},
            "shots": [
                {"src": r"G:\D\Новая папка\DisorderGameStudio-site\assets-src\pentomino\play-en-15.png", "lang": "ru", "portrait": True,
                 "ru": "Партия в разгаре", "en": "A game in progress"},
                {"src": r"G:\D\Новая папка\DisorderGameStudio-site\assets-src\pentomino\play-ru-9.png", "lang": "en", "portrait": True,
                 "ru": "Партия в разгаре", "en": "A game in progress"},
                {"src": r"G:\D\Новая папка\DisorderGameStudio-site\assets-src\pentomino\menu-ru-ui.png", "lang": "ru", "portrait": True,
                 "ru": "Три режима на выбор", "en": "Three modes to choose from"},
                {"src": r"G:\D\Новая папка\DisorderGameStudio-site\assets-src\pentomino\menu-ru.png", "lang": "en", "portrait": True,
                 "ru": "Три режима на выбор", "en": "Three modes to choose from"},
            ],
        },
    },
]
