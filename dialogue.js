const DIALOGUE = {
  // Глобальное состояние игры
  initialState: {
    time: '00:00',
    calls: 0,
    trustAlexey: 0,
    trustMarina: 0,
    dispatcherAnger: 0,
    foundClue: false,
    ending: null
  },

  // sceneId -> массив узлов
  scenes: {
    // ---------- Начало смены ----------
    start: [
      {
        speaker: 'operator',
        text: 'Алло, вы меня слышите? Я оператор горячей линии.',
        voice: 'operator',
        emotion: 'calm',
        audio: 'audio/operator_welcome.mp3'
      },
      {
        speaker: 'dispatcher',
        text: 'Доброй ночи. Смена началась. Линия открыта, жду звонки. И не засыпай на рабочем месте, понимаешь?',
        voice: 'dispatcher',
        emotion: 'strict',
        audio: 'audio/dispatcher_shift.mp3'
      },
      {
        speaker: 'system',
        text: '*Звонок. Линия 1.*',
        voice: null,
        emotion: null,
        next: 'callAlexey1'
      }
    ],

    // ---------- Звонок 1: Алексей ----------
    callAlexey1: [
      {
        speaker: 'alexey',
        text: 'Алло? Алло, вы меня слышите? Пожалуйста, скажите, что вы меня слышите!',
        voice: 'alexey',
        emotion: 'panic',
        audio: 'audio/alexey_panic.mp3',
        choices: [
          { text: 'Слышу вас, Алексей. Спокойно, дышите глубже. Что случилось?', next: 'alexeyCalm', flag: { trustAlexey: 1 } },
          { text: 'Я вас слышу, но говорите быстрее. Время на исходе.', next: 'alexeyRush', flag: { trustAlexey: -1 } },
          { text: '*Положить трубку*', next: 'alexeyHangup' }
        ]
      }
    ],
    alexeyCalm: [
      { speaker: 'alexey', text: 'Я... я в подъезде. Кто-то ломает дверь. Я закрылся в подсобке, но дверь уже скрипит.', voice: 'alexey', emotion: 'fear', audio: 'audio/alexey_fear.mp3', next: 'alexeyClue1' }
    ],
    alexeyRush: [
      { speaker: 'alexey', text: 'Вы не понимаете! Они тут! Пожалуйста, вызовите полицию, я прошу вас!', voice: 'alexey', emotion: 'panic', next: 'alexeyClue1' }
    ],
    alexeyHangup: [
      { speaker: 'system', text: '*Вы положили трубку. Через тридцать секунд раздался крик за дверью подъезда.*', voice: null, emotion: null, next: 'ring2' }
    ],
    alexeyClue1: [
      { speaker: 'alexey', text: 'На столе лежит конверт. На нём написано ваше имя. Я не открывал его...', voice: 'alexey', emotion: 'confused', audio: 'audio/alexey_envelope.mp3', choices: [
        { text: 'Откройте конверт. Читайте мне, что там.', next: 'alexeyReadEnvelope', flag: { foundClue: true } },
        { text: 'Не трогайте ничего. Ждите помощи.', next: 'alexeyWaitHelp' }
      ] }
    ],
    alexeyReadEnvelope: [
      { speaker: 'alexey', text: '"Оператор, если вы читаете это — вы следуете по нашему сценарию. Добро пожаловать в игру."', voice: 'alexey', emotion: 'dread', next: 'ring2' }
    ],
    alexeyWaitHelp: [
      { speaker: 'alexey', text: 'Я боюсь. Пожалуйста, не оставляйте меня на линии.', voice: 'alexey', emotion: 'fear', next: 'ring2' }
    ],

    // ---------- Звонок 2: Марина ----------
    ring2: [
      { speaker: 'system', text: '*Второе звонок. Неизвестный номер.*', voice: null, emotion: null, next: 'callMarina1' }
    ],
    callMarina1: [
      {
        speaker: 'marina',
        text: 'Здравствуйте. Вы не знаете, случайно, кем вы были до того, как сели за этот пульт?',
        voice: 'marina',
        emotion: 'calm',
        audio: 'audio/marina_mystery.mp3',
        choices: [
          { text: 'Я оператор горячей линии. Боль ничего не помню.', next: 'marinaDodge', flag: { trustMarina: 0 } },
          { text: 'Зачем вы спрашиваете? Кто вы такая?', next: 'marinaConfront', flag: { trustMarina: -1 } },
          { text: '...Не помню. А вы кто?', next: 'marinaMystery', flag: { trustMarina: 1 } }
        ]
      }
    ],
    marinaDodge: [
      { speaker: 'marina', text: 'Интересно. Память стирается первой. Будьте осторожны, оператор.', voice: 'marina', emotion: 'calm', next: 'ring3' }
    ],
    marinaConfront: [
      { speaker: 'marina', text: 'Я — тот, кто звонит вам второй раз. И последний, если вы будете грубить.', voice: 'marina', emotion: 'cold', next: 'ring3' }
    ],
    marinaMystery: [
      { speaker: 'marina', text: 'Я — эхо прошлого смены. А вы — следующий в очереди.', voice: 'marina', emotion: 'mysterious', audio: 'audio/marina_echo.mp3', next: 'ring3' }
    ],

    // ---------- Звонок 3: Диспетчер / Кризис ----------
    ring3: [
      { speaker: 'system', text: '*Третий звонок. Внутренняя линия. Диспетчер.*', voice: null, emotion: null, next: 'callDispatcher1' }
    ],
    callDispatcher1: [
      {
        speaker: 'dispatcher',
        text: 'Оператор! Вы там вообще в курсе, что происходит? На линии двое пострадавших, а связь с ними пропадает!',
        voice: 'dispatcher',
        emotion: 'angry',
        audio: 'audio/dispatcher_angry.mp3',
        next: 'dispatcherInterruption'
      }
    ],
    dispatcherInterruption: [
      { speaker: 'system', text: '*Линия прерывается скрежетом. На экране мигает надпись: "СИГНАЛ ТРЕВОГИ".*', voice: null, emotion: null, next: 'finalChoice' }
    ],

    // ---------- Финальный выбор ----------
    finalChoice: [
      {
        speaker: 'system',
        text: '*Все три линии звонят одновременно. Кто вы выбираете?*',
        voice: null,
        emotion: null,
        choices: [
          { text: 'Алексей — он в опасности.', next: 'endingAlexey', flag: {} },
          { text: 'Марина — она знает правду.', next: 'endingMarina', flag: {} },
          { text: 'Диспетчер — он мой начальник.', next: 'endingDispatcher', flag: {} },
          { text: 'Положить все трубки и уйти.', next: 'endingLeave', flag: {} }
        ]
      }
    ],

    // ---------- Эпилоги ----------
    endingAlexey: [
      { speaker: 'alexey', text: 'Спасибо... вы спасли меня. Но помните: двери всегда открыты для тех, кто звонит.', voice: 'alexey', emotion: 'relief', ending: 'alexey' },
      { speaker: 'system', text: '*Утро. Смена закончилась. Вы выходите на улицу. За вами наблюдают из окон подъезда.*', voice: null, emotion: null, ending: 'alexey' }
    ],
    endingMarina: [
      { speaker: 'marina', text: 'Вы выбрали меня. Теперь вы часть сценария. Добро пожаловать в ночную смену.', voice: 'marina', emotion: 'mysterious', audio: 'audio/marina_ending.mp3', ending: 'marina' },
      { speaker: 'system', text: '*Вы садитесь за пульт. На экране горит ваше имя. Звонок поступает...', voice: null, emotion: null, ending: 'marina' }
    ],
    endingDispatcher: [
      { speaker: 'dispatcher', text: 'Молодец. Ты выбрал порядок. Но порядок — это еще не безопасность.', voice: 'dispatcher', emotion: 'strict', ending: 'dispatcher' },
      { speaker: 'system', text: '*Вы никогда больше не выходили из здания 콜센тера.*', voice: null, emotion: null, ending: 'dispatcher' }
    ],
    endingLeave: [
      { speaker: 'system', text: '*Вы выходите из здания. Телефон в кармане вибрирует. Неизвестный номер.*', voice: null, emotion: null, ending: 'leave' },
      { speaker: 'system', text: '*Вы не отвечаете. Игра окончена.*', voice: null, emotion: null, ending: 'leave' }
    ]
  },

  // Эпилоги: заголовок и текст
  endings: {
    alexey: {
      title: 'Спасённый',
      text: 'Вы спасли Алексея. Но ночная горячая линия не забывает своих операторов. Вы 살아ли — пока.'
    },
    marina: {
      title: 'Новая смена',
      text: 'Вы приняли приглашение Марины. Теперь вы — часть горячей линии. Вечно.'
    },
    dispatcher: {
      title: 'Порядок',
      text: 'Вы выбрали диспетчера. Порядок восстановлен. Вы больше никогда не услышите звонок.'
    },
    leave: {
      title: 'Уход',
      text: 'Вы ушли. Но телефон всё ещё звонит. И кто-то на конце линии знает ваш номер.'
    }
  },

  // Цвета и оформление говорящего
  speakers: {
    operator: { label: 'ОПЕРАТОР', colorClass: 'speaker-operator', borderClass: 'border-operator', face: '🎧' },
    alexey: { label: 'АЛЕКСЕЙ', colorClass: 'speaker-caller', borderClass: 'border-caller', face: '😰' },
    marina: { label: 'МАРИНА', colorClass: 'speaker-marina', borderClass: 'border-marina', face: '🕯️' },
    dispatcher: { label: 'ДИСПЕТЧЕР', colorClass: 'speaker-dispatcher', borderClass: 'border-dispatcher', face: '👔' },
    system: { label: 'СИСТЕМА', colorClass: 'speaker-caller', borderClass: 'border-caller', face: '🖥️' }
  },

  // Голосовые настройки (Web Speech API fallback)
  voices: {
    operator: { lang: 'ru-RU', rate: 0.95, pitch: 1.0 },
    alexey: { lang: 'ru-RU', rate: 1.1, pitch: 1.15 },
    marina: { lang: 'ru-RU', rate: 0.85, pitch: 0.9 },
    dispatcher: { lang: 'ru-RU', rate: 1.0, pitch: 0.85 }
  }
};
