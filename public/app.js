(() => {
  const STORAGE_KEYS = Object.freeze({ locale: 'mirrised.locale', palette: 'mirrised.palette' });
  const DICTIONARY = Object.freeze({
    ru: {
      'title.home': 'Mirrised — трансляция экрана', 'title.room': 'Mirrised — комната',
      'header.service': 'SCREEN SHARE', 'header.room': 'SECURE ROOM',
      'home.eyebrow': 'ТРАНСЛЯЦИЯ ЭКРАНА / БРАУЗЕР', 'home.title': 'ПОКАЖИТЕ ЭКРАН.<br />БЕЗ УСТАНОВКИ.', 'home.intro': 'Ведущий создаёт комнату, зритель открывает ссылку, а изображение передаётся напрямую между браузерами.',
      'home.create.kicker': 'НОВАЯ КОМНАТА', 'home.create.title': 'НАЧНИТЕ ПОКАЗ', 'home.create.copy': 'Создайте приватную комнату и получите ссылку для зрителя.', 'home.create.loading': 'ПОДКЛЮЧАЕМСЯ…',
      'home.join.kicker': 'ЕСТЬ ПРИГЛАШЕНИЕ?', 'home.join.title': 'ВОЙТИ ПО КОДУ', 'home.join.copy': 'Введите код комнаты, который отправил ведущий.', 'home.join.action': 'ПРОДОЛЖИТЬ',
      'home.mode.label': 'РЕЖИМ КОМНАТЫ', 'home.pin.label': 'PIN-КОД (НЕОБЯЗАТЕЛЬНО)', 'home.pin.placeholder': '4–8 цифр', 'home.code.label': 'КОД КОМНАТЫ', 'home.code.placeholder': 'A7K9X2B4',
      'mode.direct': 'P2P НАПРЯМУЮ — 1 ЗРИТЕЛЬ, ТОЛЬКО STUN', 'mode.reliable': 'P2P С TURN — 1 ЗРИТЕЛЬ, РЕЗЕРВНЫЙ МАРШРУТ', 'mode.group': 'ГРУППА — ДО 6 ЗРИТЕЛЕЙ, P2P-СЕТКА', 'mode.direct.short': 'P2P НАПРЯМУЮ', 'mode.direct.detail': 'Только прямой WebRTC-канал', 'mode.reliable.short': 'P2P С TURN', 'mode.reliable.detail': 'Прямой канал с резервным маршрутом', 'mode.group.short': 'ГРУППА ДО 6 ЗРИТЕЛЕЙ', 'mode.group.detail': 'Отдельный P2P-поток каждому зрителю',
      'home.how.kicker': 'КАК ЭТО РАБОТАЕТ', 'home.how.title': 'ТРИ ПРОСТЫХ ШАГА', 'home.step1.title': 'СОЗДАЙТЕ КОМНАТУ.', 'home.step1.copy': 'Ведущий получает приватную ссылку.', 'home.step2.title': 'ОТПРАВЬТЕ ССЫЛКУ.', 'home.step2.copy': 'Выберите режим для одного зрителя или группы до шести человек.', 'home.step3.title': 'ВЫБЕРИТЕ ЭКРАН.', 'home.step3.copy': 'Браузер откроет системное окно выбора.',
      'home.notice': 'Вы сами выбираете экран или окно. Захват никогда не запускается автоматически, а сервер не записывает видеопоток.',
      'room.kicker': 'КОМНАТА ТРАНСЛЯЦИИ', 'room.connecting': 'ПОДКЛЮЧЕНИЕ К КОМНАТЕ…', 'room.checking': 'ПРОВЕРЯЕМ КОМНАТУ…', 'room.code': 'КОД КОМНАТЫ', 'room.link': 'ССЫЛКА ДЛЯ ЗРИТЕЛЯ', 'room.copy': 'КОПИРОВАТЬ', 'room.leave': 'ВЫЙТИ ИЗ КОМНАТЫ', 'room.privacy': 'Вы сами выбираете экран в системном окне браузера. Видеопоток не записывается и не сохраняется на сервере.',
      'role.pending': 'РОЛЬ: ОЖИДАНИЕ', 'role.host': 'РОЛЬ: ВЕДУЩИЙ', 'role.viewer': 'РОЛЬ: ЗРИТЕЛЬ', 'status.connection': 'ПОДКЛЮЧЕНИЕ', 'status.waitHost': 'ОЖИДАНИЕ ВЕДУЩЕГО', 'status.waitConnection': 'ОЖИДАНИЕ СОЕДИНЕНИЯ', 'status.route': 'МАРШРУТ', 'status.routePending': 'ОПРЕДЕЛИТСЯ ПОСЛЕ ПОДКЛЮЧЕНИЯ',
      'pin.copy': 'Комната защищена PIN-кодом. PIN не передаётся в ссылке.', 'pin.label': 'PIN-КОД КОМНАТЫ', 'pin.action': 'ПОДТВЕРДИТЬ',
      'video.kicker': 'ВИДЕО', 'video.title': 'ТРАНСЛЯЦИЯ ЭКРАНА', 'video.placeholder': 'Видео появится здесь после начала трансляции.', 'video.waiting': 'Ожидаем трансляцию ведущего.',
      'share.idle': 'ТРАНСЛЯЦИЯ НЕ ЗАПУЩЕНА', 'share.start': 'НАЧАТЬ ТРАНСЛЯЦИЮ', 'share.stop': 'ОСТАНОВИТЬ', 'quality.label': 'КАЧЕСТВО ТРАНСЛЯЦИИ', 'quality.economy': 'ЭКОНОМИЯ — ДО 720P, 30 FPS', 'quality.standard': 'СТАНДАРТ — ДО 1080P, 30 FPS', 'quality.crisp': 'ЧЁТКОЕ — ДО 2K, 10 FPS', 'quality.high': 'ВЫСОКОЕ — ДО 2K, 60 FPS',
      'echo.kicker': 'НА СВЯЗИ', 'echo.home.title': 'СООБЩЕНИЯ ВО ВРЕМЯ ПОКАЗА', 'echo.home.copy': 'Echo можно открыть в отдельной вкладке для сообщений и ссылок — трансляция продолжится.', 'echo.room.title': 'ОБСУДИТЕ ТРАНСЛЯЦИЮ В ECHO', 'echo.room.copy': 'Откройте чат в отдельной вкладке — трансляция останется активной.', 'echo.open': 'ОТКРЫТЬ ECHO ↗', 'footer.echo': 'Нужен быстрый чат?', 'footer.echoLink': 'ОТКРОЙТЕ ECHO ↗', 'toast.error': 'ОШИБКА', 'toast.info': 'СОСТОЯНИЕ', 'aria.interface': 'Настройки интерфейса', 'aria.language': 'Язык', 'aria.palette': 'Палитра', 'aria.peach': 'Персиковая палитра', 'aria.sage': 'Sage-палитра', 'aria.shareLink': 'Ссылка для зрителя'
    },
    en: {
      'title.home': 'Mirrised — screen sharing', 'title.room': 'Mirrised — room',
      'header.service': 'SCREEN SHARE', 'header.room': 'SECURE ROOM',
      'home.eyebrow': 'SCREEN SHARING / BROWSER', 'home.title': 'SHOW YOUR SCREEN.<br />NO INSTALL.', 'home.intro': 'The host creates a room, the viewer opens the link, and the image travels directly between browsers.',
      'home.create.kicker': 'NEW ROOM', 'home.create.title': 'START A SHARE', 'home.create.copy': 'Create a private room and get a link for a viewer.', 'home.create.loading': 'CONNECTING…',
      'home.join.kicker': 'HAVE AN INVITATION?', 'home.join.title': 'JOIN BY CODE', 'home.join.copy': 'Enter the room code sent by the host.', 'home.join.action': 'CONTINUE',
      'home.mode.label': 'ROOM MODE', 'home.pin.label': 'PIN CODE (OPTIONAL)', 'home.pin.placeholder': '4–8 digits', 'home.code.label': 'ROOM CODE', 'home.code.placeholder': 'A7K9X2B4',
      'mode.direct': 'P2P DIRECT — 1 VIEWER, STUN ONLY', 'mode.reliable': 'P2P WITH TURN — 1 VIEWER, FALLBACK ROUTE', 'mode.group': 'GROUP — UP TO 6 VIEWERS, P2P MESH', 'mode.direct.short': 'P2P DIRECT', 'mode.direct.detail': 'Direct WebRTC connection only', 'mode.reliable.short': 'P2P WITH TURN', 'mode.reliable.detail': 'Direct connection with a fallback route', 'mode.group.short': 'GROUP UP TO 6 VIEWERS', 'mode.group.detail': 'A separate P2P stream for each viewer',
      'home.how.kicker': 'HOW IT WORKS', 'home.how.title': 'THREE SIMPLE STEPS', 'home.step1.title': 'CREATE A ROOM.', 'home.step1.copy': 'The host receives a private link.', 'home.step2.title': 'SEND THE LINK.', 'home.step2.copy': 'Choose a private mode or a group of up to six people.', 'home.step3.title': 'CHOOSE A SCREEN.', 'home.step3.copy': 'Your browser opens its native picker.',
      'home.notice': 'You choose the screen or window yourself. Capture never starts automatically and the server never records video.',
      'room.kicker': 'TRANSMISSION ROOM', 'room.connecting': 'CONNECTING TO ROOM…', 'room.checking': 'CHECKING THE ROOM…', 'room.code': 'ROOM CODE', 'room.link': 'VIEWER INVITATION LINK', 'room.copy': 'COPY', 'room.leave': 'LEAVE ROOM', 'room.privacy': 'You choose the screen in your browser’s system picker. The video stream is never recorded or stored on the server.',
      'role.pending': 'ROLE: PENDING', 'role.host': 'ROLE: HOST', 'role.viewer': 'ROLE: VIEWER', 'status.connection': 'CONNECTION', 'status.waitHost': 'WAITING FOR HOST', 'status.waitConnection': 'WAITING FOR CONNECTION', 'status.route': 'ROUTE', 'status.routePending': 'DETERMINED AFTER CONNECTING',
      'pin.copy': 'This room is protected with a PIN. The PIN is never sent in the link.', 'pin.label': 'ROOM PIN', 'pin.action': 'CONFIRM',
      'video.kicker': 'VIDEO', 'video.title': 'SCREEN SHARE', 'video.placeholder': 'Video will appear here after sharing starts.', 'video.waiting': 'Waiting for the host stream.',
      'share.idle': 'SHARING HAS NOT STARTED', 'share.start': 'START SHARING', 'share.stop': 'STOP', 'quality.label': 'SHARE QUALITY', 'quality.economy': 'ECONOMY — UP TO 720P, 30 FPS', 'quality.standard': 'STANDARD — UP TO 1080P, 30 FPS', 'quality.crisp': 'CRISP — UP TO 2K, 10 FPS', 'quality.high': 'HIGH — UP TO 2K, 60 FPS',
      'echo.kicker': 'STAY CONNECTED', 'echo.home.title': 'MESSAGES DURING THE SHARE', 'echo.home.copy': 'Echo can be opened in a separate tab for messages and links — the stream keeps running.', 'echo.room.title': 'DISCUSS THE SHARE IN ECHO', 'echo.room.copy': 'Open chat in a separate tab — the stream stays active.', 'echo.open': 'OPEN ECHO ↗', 'footer.echo': 'Need a quick chat?', 'footer.echoLink': 'OPEN ECHO ↗', 'toast.error': 'ERROR', 'toast.info': 'STATUS', 'aria.interface': 'Interface settings', 'aria.language': 'Language', 'aria.palette': 'Palette', 'aria.peach': 'Peach palette', 'aria.sage': 'Sage palette', 'aria.shareLink': 'Viewer invitation link'
    }
  });

  let locale = localStorage.getItem(STORAGE_KEYS.locale) === 'en' ? 'en' : 'ru';
  let palette = localStorage.getItem(STORAGE_KEYS.palette) === 'sage' ? 'sage' : 'warm';
  let translationsApplied = false;
  const dynamicTextIds = new Set(['room-title', 'room-status', 'role-label', 'connection-status', 'webrtc-status', 'route-status', 'share-state', 'remote-stream-state', 'pin-feedback']);
  const rawEnglish = Object.freeze({
    'Подключаемся к серверу…': 'Connecting to server…', 'Создаём комнату…': 'Creating room…', 'Комната создана': 'Room created', 'Ожидание зрителя': 'Waiting for viewer', 'Зритель подключён': 'Viewer connected', 'Вы подключились как зритель': 'You joined as a viewer', 'Зрители подключаются': 'Viewers are joining', 'Зрители подключены': 'Viewers connected', 'Восстанавливаем подключение': 'Restoring connection', 'Введите PIN-код комнаты': 'Enter the room PIN', 'Не указан код комнаты': 'No room code was provided', 'Не удалось подключиться': 'Could not connect', 'Введите PIN из 4–8 цифр.': 'Enter a 4–8 digit PIN.', 'Проверяем PIN-код…': 'Checking PIN…', 'Трансляция завершена.': 'Sharing ended.', 'Трансляция завершена': 'Sharing ended', 'Комната закрыта': 'Room closed', 'Комната занята': 'Room is full', 'Соединение потеряно': 'Connection lost', 'Ожидание ведущего': 'Waiting for host', 'Ожидание соединения': 'Waiting for connection', 'Установка соединения': 'Establishing connection', 'Нет подключения к серверу. Проверьте сеть и обновите страницу.': 'No connection to the server. Check your network and reload the page.', 'Нет соединения с сервером. Проверьте сеть и повторите попытку.': 'No connection to the server. Check your network and try again.', 'Ваш браузер не поддерживает WebRTC. Откройте комнату в современном браузере.': 'Your browser does not support WebRTC. Open the room in a modern browser.', 'Ваш браузер не поддерживает getDisplayMedia. Откройте комнату в современном браузере.': 'Your browser does not support getDisplayMedia. Open the room in a modern browser.', 'Трансляция не запущена': 'Sharing has not started', 'Трансляция остановлена': 'Sharing stopped', 'Трансляция активна': 'Sharing is active', 'Определится после подключения': 'Determined after connecting', 'P2P напрямую': 'P2P direct', 'Через TURN-сервер': 'Via TURN server', 'P2P + TURN': 'P2P + TURN', 'Ожидаем трансляцию ведущего.': 'Waiting for the host stream.', 'Видео появится здесь после начала трансляции.': 'Video will appear here after sharing starts.'
  });
  const ECHO_COPY = Object.freeze({
    ru: {
      'header.service': 'БЕЗ РЕГИСТРАЦИИ',
      'home.title': 'ЭКРАН.<br />ССЫЛКА.<br />ПОКАЗ.',
      'home.intro': 'Создайте комнату за секунду. Передайте ссылку зрителю — изображение передаётся напрямую между браузерами без записи.',
      'home.create.copy': 'Создайте приватную комнату и получите ссылку для зрителя.',
      'home.join.kicker': 'ЕСТЬ ПРИГЛАШЕНИЕ?',
      'home.join.title': 'ВОЙТИ ПО КОДУ'
    },
    en: {
      'header.service': 'NO SIGN-UP',
      'home.title': 'SCREEN.<br />LINK.<br />SHARE.',
      'home.intro': 'Create a room in seconds. Send the link to a viewer — the image moves directly between browsers without recording.',
      'home.create.copy': 'Create a private room and get a link for a viewer.',
      'home.join.kicker': 'HAVE AN INVITATION?',
      'home.join.title': 'JOIN BY CODE'
    }
  });
  const t = (key) => ECHO_COPY[locale]?.[key] || DICTIONARY[locale]?.[key] || ECHO_COPY.ru[key] || DICTIONARY.ru[key] || key;
  const message = (value) => locale === 'en' ? (rawEnglish[value] || value) : value;
  const applyTranslations = () => {
    document.documentElement.lang = locale;
    document.documentElement.dataset.theme = palette;
    document.title = t(document.body.dataset.pageTitle || 'title.home');
    document.querySelectorAll('[data-i18n]').forEach((element) => {
      if (!translationsApplied || !dynamicTextIds.has(element.id)) element.innerHTML = t(element.dataset.i18n);
    });
    document.querySelectorAll('[data-i18n-placeholder]').forEach((element) => { element.placeholder = t(element.dataset.i18nPlaceholder); });
    document.querySelectorAll('[data-i18n-aria]').forEach((element) => { element.setAttribute('aria-label', t(element.dataset.i18nAria)); });
    document.querySelectorAll('[data-language-label]').forEach((label) => { label.textContent = locale === 'en' ? 'English' : 'Русский'; });
    document.querySelectorAll('[data-theme-label]').forEach((label) => { label.textContent = palette === 'sage' ? 'Sage' : (locale === 'en' ? 'Warm' : 'Тёплая'); });
    translationsApplied = true;
  };
  const showToast = (kind, detail) => {
    const region = document.querySelector('#toast-region');
    if (!region || !detail) return;
    const toast = document.createElement('div');
    toast.className = 'toast'; toast.dataset.kind = kind;
    const title = document.createElement('strong'); title.textContent = t(kind === 'error' ? 'toast.error' : 'toast.info');
    const body = document.createElement('span'); body.textContent = message(detail);
    toast.append(title, body); region.replaceChildren(toast);
    window.setTimeout(() => { if (region.contains(toast)) toast.remove(); }, 5_000);
  };
  document.addEventListener('DOMContentLoaded', () => {
    applyTranslations();
    document.querySelectorAll('[data-language-toggle]').forEach((button) => button.addEventListener('click', () => { locale = locale === 'en' ? 'ru' : 'en'; localStorage.setItem(STORAGE_KEYS.locale, locale); applyTranslations(); window.dispatchEvent(new CustomEvent('mirrised:localechange')); }));
    document.querySelectorAll('[data-theme-toggle]').forEach((button) => button.addEventListener('click', () => { palette = palette === 'sage' ? 'warm' : 'sage'; localStorage.setItem(STORAGE_KEYS.palette, palette); applyTranslations(); }));
    const observer = new MutationObserver((records) => {
      if (locale !== 'en') return;
      for (const record of records) {
        const element = record.target.nodeType === Node.ELEMENT_NODE ? record.target : record.target.parentElement;
        const target = element?.closest?.('[id]');
        if (!target || !dynamicTextIds.has(target.id)) continue;
        const translated = message(target.textContent);
        if (translated !== target.textContent) target.textContent = translated;
      }
    });
    observer.observe(document.body, { childList: true, characterData: true, subtree: true });
  });
  window.MirrisedI18n = { t, message, showToast, getLocale: () => locale };
})();

(() => {
  const roomIdOutput = document.querySelector('#room-id');
  const DEFAULT_RTC_CONFIGURATION = {
    iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
  };
  const WEBRTC_TIMEOUT_MS = 20_000;
  const MAX_PENDING_ICE_CANDIDATES = 128;
  const SHARE_QUALITY_PRESETS = Object.freeze({
    economy: {
      video: { width: { ideal: 1280 }, height: { ideal: 720 }, frameRate: { ideal: 30 } },
      hint: 'До 720p и 30 fps — плавный режим с экономным расходом трафика.'
    },
    standard: {
      video: { width: { ideal: 1920 }, height: { ideal: 1080 }, frameRate: { ideal: 30 } },
      hint: 'До 1080p и 30 fps — сбалансированный режим для большинства трансляций.'
    },
    crisp: {
      video: { width: { ideal: 2560 }, height: { ideal: 1440 }, frameRate: { ideal: 10 } },
      hint: 'До 2K и 10 fps — чёткий экран для документов, кода и неспешных действий.'
    },
    high: {
      video: { width: { ideal: 2560 }, height: { ideal: 1440 }, frameRate: { ideal: 60 } },
      hint: 'До 2K и 60 fps — нужна хорошая производительность и высокая исходящая скорость.'
    }
  });

  function openRoom(roomId, isHost = false, hostToken = '') {
    const params = new URLSearchParams({ room: roomId });
    if (isHost) {
      params.set('host', '1');
      params.set('token', hostToken);
    }
    window.location.assign(`/room.html?${params.toString()}`);
  }

  if (roomIdOutput) {
    const i18n = window.MirrisedI18n || { t: (key) => key, message: (value) => value, showToast: () => {} };
    const roomTitle = document.querySelector('#room-title');
    const roomStatus = document.querySelector('#room-status');
    const roleLabel = document.querySelector('#role-label');
    const connectionStatus = document.querySelector('#connection-status');
    const connectionStatusCard = document.querySelector('#connection-status-card');
    const webrtcStatus = document.querySelector('#webrtc-status');
    const webrtcStatusCard = document.querySelector('#webrtc-status-card');
    const routeStatus = document.querySelector('#route-status');
    const routeStatusCard = document.querySelector('#route-status-card');
    const errorBox = document.querySelector('#error-box');
    const shareLink = document.querySelector('#share-link');
    const copyLinkButton = document.querySelector('#copy-link');
    const leaveRoomButton = document.querySelector('#leave-room');
    const videoPlaceholder = document.querySelector('#video-placeholder');
    const hostControls = document.querySelector('#host-controls');
    const viewerStream = document.querySelector('#viewer-stream');
    const shareState = document.querySelector('#share-state');
    const remoteStreamState = document.querySelector('#remote-stream-state');
    const startShareButton = document.querySelector('#start-share');
    const stopShareButton = document.querySelector('#stop-share');
    const shareQualitySelect = document.querySelector('#share-quality');
    const shareQualityHint = document.querySelector('#share-quality-hint');
    const localPreview = document.querySelector('#local-preview');
    const remotePreview = document.querySelector('#remote-preview');
    const pinForm = document.querySelector('#room-pin-form');
    const pinInput = document.querySelector('#room-pin');
    const pinFeedback = document.querySelector('#pin-feedback');
    const submitPinButton = document.querySelector('#submit-room-pin');
    const params = new URLSearchParams(window.location.search);
    const roomId = params.get('room')?.trim();
    const isHostIntent = params.get('host') === '1';
    const hostToken = params.get('token') || '';

    let role = null;
    let localStream = null;
    let viewerPeerConnection = null;
    let viewerSessionId = null;
    let socket = null;
    let rtcConfiguration = DEFAULT_RTC_CONFIGURATION;
    let turnCredentialsPromise = Promise.resolve();
    let connectionTimeoutId = null;
    let iceDisconnectTimeoutId = null;
    let hasSocketConnected = false;
    let viewerPin = '';
    let viewerRejoinTimer = null;
    let viewerRejoinAttempts = 0;
    const MAX_VIEWER_REJOIN_ATTEMPTS = 4;
    const viewerIds = new Set();
    const hostConnections = new Map();
    const hostRouteStates = new Map();
    let roomConfig = { mode: 'reliable', modeLabel: 'P2P с TURN', maxViewers: 1, allowTurn: true };
    const pendingIceCandidates = new Map();

    roomIdOutput.textContent = roomId || i18n.message('Не указан');

    const setRoomStatus = (message) => {
      roomStatus.textContent = i18n.message(message);
    };

    const setConnectionStatus = (status, message) => {
      connectionStatusCard.dataset.status = status;
      connectionStatus.textContent = i18n.message(message);
    };

    const setWebRTCStatus = (status, message) => {
      webrtcStatusCard.dataset.status = status;
      webrtcStatus.textContent = i18n.message(message);
    };

    const setRouteStatus = (route, message) => {
      routeStatusCard.dataset.route = route;
      routeStatus.textContent = i18n.message(message);
    };

    const updateHostRouteStatus = () => {
      const routes = [...hostRouteStates.values()];
      if (!routes.length) {
        setRouteStatus('waiting', 'Определится после подключения');
        return;
      }
      const hasP2P = routes.includes('p2p');
      const hasRelay = routes.includes('relay');
      if (hasP2P && hasRelay) {
        setRouteStatus('mixed', 'P2P + TURN');
      } else if (hasRelay) {
        setRouteStatus('relay', 'Через TURN-сервер');
      } else {
        setRouteStatus('p2p', 'P2P напрямую');
      }
    };

    const updateRouteStatus = async (connection, viewerId) => {
      if (!connection || connection.connectionState === 'closed') {
        if (viewerId) {
          hostRouteStates.delete(viewerId);
          updateHostRouteStatus();
        } else {
          setRouteStatus('waiting', 'Определится после подключения');
        }
        return;
      }

      if (!viewerId || !hostRouteStates.size) setRouteStatus('detecting', 'Определяем маршрут…');
      try {
        const stats = await connection.getStats();
        let candidatePair = null;

        for (const report of stats.values()) {
          if (report.type === 'transport' && report.selectedCandidatePairId) {
            candidatePair = stats.get(report.selectedCandidatePairId);
            break;
          }
        }

        if (!candidatePair) {
          for (const report of stats.values()) {
            if (report.type === 'candidate-pair' && (report.selected || (report.nominated && report.state === 'succeeded'))) {
              candidatePair = report;
              break;
            }
          }
        }

        if (!candidatePair) {
          if (viewerId) updateHostRouteStatus();
          else setRouteStatus('waiting', 'Маршрут пока не определён');
          return;
        }

        const localCandidate = stats.get(candidatePair.localCandidateId);
        const remoteCandidate = stats.get(candidatePair.remoteCandidateId);
        const usesRelay = localCandidate?.candidateType === 'relay' || remoteCandidate?.candidateType === 'relay';
        if (viewerId) {
          hostRouteStates.set(viewerId, usesRelay ? 'relay' : 'p2p');
          updateHostRouteStatus();
        } else {
          setRouteStatus(usesRelay ? 'relay' : 'p2p', usesRelay ? 'Через TURN-сервер' : 'P2P напрямую');
        }
      } catch (error) {
        console.warn('Unable to determine the selected WebRTC route:', error);
        if (viewerId) updateHostRouteStatus();
        else setRouteStatus('waiting', 'Маршрут не удалось определить');
      }
    };

    const setRole = (nextRole) => {
      roleLabel.dataset.role = nextRole || 'pending';
      roleLabel.textContent = nextRole === 'host'
        ? i18n.t('role.host')
        : nextRole === 'viewer'
          ? i18n.t('role.viewer')
          : i18n.t('role.pending');
    };

    const setRoomConfig = (config = {}) => {
      roomConfig = {
        ...roomConfig,
        ...config
      };
    };

    const updateHostViewerStatus = () => {
      const count = viewerIds.size;
      if (!count) {
        setConnectionStatus('waiting', 'Ожидание зрителя');
        if (localStream) setWebRTCStatus('waiting', 'Ожидание нового соединения');
        return;
      }
      const label = roomConfig.maxViewers > 1
        ? `Зрители: ${count} из ${roomConfig.maxViewers}`
        : 'Зритель подключён';
      setConnectionStatus('active', label);
      if (localStream) setWebRTCStatus('connecting', 'Установка соединений со зрителями');
    };

    const showError = (message) => {
      errorBox.textContent = i18n.message(message);
      errorBox.hidden = false;
      i18n.showToast('error', message);
    };

    const clearError = () => {
      errorBox.textContent = '';
      errorBox.hidden = true;
    };

    const showVideo = (video) => {
      videoPlaceholder.hidden = true;
      video.hidden = false;
      if (video === remotePreview) remoteStreamState.hidden = true;
    };

    const showVideoPlaceholder = () => {
      videoPlaceholder.hidden = false;
    };

    const setShareState = (state, message) => {
      shareState.dataset.state = state;
      shareState.textContent = i18n.message(message);
    };

    const setRemoteStreamState = (message) => {
      remoteStreamState.textContent = i18n.message(message);
    };

    const updateShareQualityHint = () => {
      const preset = SHARE_QUALITY_PRESETS[shareQualitySelect?.value] || SHARE_QUALITY_PRESETS.standard;
      shareQualityHint.textContent = i18n.message(preset.hint);
    };

    const describeCapture = (videoTrack) => {
      const { width, height, frameRate } = videoTrack?.getSettings?.() || {};
      if (!width || !height) return 'Качество определено браузером.';
      const fps = Number.isFinite(frameRate) ? `, ${Math.round(frameRate)} fps` : '';
      return `Захват: ${width}×${height}${fps}.`;
    };

    const loadTurnCredentials = () => new Promise((resolve) => {
      const timeoutId = window.setTimeout(resolve, 5_000);
      socket.emit('get-turn-credentials', (response) => {
        window.clearTimeout(timeoutId);
        if (response?.ok && Array.isArray(response.iceServers) && response.iceServers.length) {
          rtcConfiguration = { iceServers: response.iceServers };
          if (typeof response.allowTurn === 'boolean') setRoomConfig({ allowTurn: response.allowTurn });
        } else if (response?.message) {
          console.warn('TURN credentials were not issued:', response.message);
        }
        resolve();
      });
    });

    const createSessionId = () => (
      crypto.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`
    );

    const clearConnectionTimeout = () => {
      window.clearTimeout(connectionTimeoutId);
      connectionTimeoutId = null;
    };

    const clearIceDisconnectTimeout = () => {
      window.clearTimeout(iceDisconnectTimeoutId);
      iceDisconnectTimeoutId = null;
    };

    const startConnectionTimeout = (connection, message) => {
      clearConnectionTimeout();
      connectionTimeoutId = window.setTimeout(() => {
        if (connection.connectionState === 'connected' || connection.connectionState === 'closed') return;
        console.warn('WebRTC connection timeout');
        showError(message);
        setWebRTCStatus('error', 'Подключение не установлено');
        if (connection === viewerPeerConnection) stopRemotePlayback('Подключение к трансляции заняло слишком много времени.');
      }, WEBRTC_TIMEOUT_MS);
    };

    const queueIceCandidate = (sessionId, candidate) => {
      if (!sessionId || !candidate) return;
      const queue = pendingIceCandidates.get(sessionId) || [];
      if (queue.length >= MAX_PENDING_ICE_CANDIDATES) {
        console.warn('Too many pending ICE candidates; dropping the oldest candidate.');
        queue.shift();
      }
      queue.push(candidate);
      pendingIceCandidates.set(sessionId, queue);
    };

    const addIceCandidate = async (connection, sessionId, candidate) => {
      if (!candidate) return;

      if (!connection || !connection.remoteDescription) {
        queueIceCandidate(sessionId, candidate);
        return;
      }

      try {
        await connection.addIceCandidate(candidate);
      } catch (error) {
        console.warn('Не удалось добавить ICE-кандидат:', error);
        setWebRTCStatus('error', 'Не удалось настроить сетевое соединение');
        showError('Не удалось настроить сетевое соединение. Попробуйте переподключиться к комнате.');
      }
    };

    const flushIceCandidates = async (connection, sessionId) => {
      const queue = pendingIceCandidates.get(sessionId) || [];
      pendingIceCandidates.delete(sessionId);

      for (const candidate of queue) {
        await addIceCandidate(connection, sessionId, candidate);
      }
    };

    const clearHostConnectionTimers = (entry) => {
      window.clearTimeout(entry?.connectionTimeoutId);
      window.clearTimeout(entry?.iceDisconnectTimeoutId);
      if (entry) {
        entry.connectionTimeoutId = null;
        entry.iceDisconnectTimeoutId = null;
      }
    };

    const closeHostConnection = (viewerId) => {
      if (!viewerId) {
        for (const id of [...hostConnections.keys()]) closeHostConnection(id);
        setRouteStatus('waiting', 'Определится после подключения');
        return;
      }

      const entry = hostConnections.get(viewerId);
      if (!entry) return;
      clearHostConnectionTimers(entry);
      pendingIceCandidates.delete(entry.sessionId);
      entry.connection.onicecandidate = null;
      entry.connection.onconnectionstatechange = null;
      entry.connection.oniceconnectionstatechange = null;
      entry.connection.onsignalingstatechange = null;
      entry.connection.close();
      hostConnections.delete(viewerId);
      hostRouteStates.delete(viewerId);
      updateHostRouteStatus();
    };

    const handleHostConnectionFailure = (viewerId, message) => {
      console.warn(message);
      closeHostConnection(viewerId);
      if (localStream) {
        setRoomStatus(message);
        setWebRTCStatus('waiting', 'Ожидаем повторное подключение зрителя');
      }
    };

    const stopRemotePlayback = (message) => {
      clearConnectionTimeout();
      clearIceDisconnectTimeout();
      setRouteStatus('waiting', 'Определится после подключения');
      const sessionId = viewerSessionId;
      viewerSessionId = null;
      pendingIceCandidates.delete(sessionId);

      if (viewerPeerConnection) {
        viewerPeerConnection.onicecandidate = null;
        viewerPeerConnection.ontrack = null;
        viewerPeerConnection.onconnectionstatechange = null;
        viewerPeerConnection.oniceconnectionstatechange = null;
        viewerPeerConnection.onsignalingstatechange = null;
        viewerPeerConnection.close();
        viewerPeerConnection = null;
      }

      remotePreview.pause();
      remotePreview.srcObject = null;
      remotePreview.hidden = true;
      remoteStreamState.hidden = false;
      setRemoteStreamState(message);
      showVideoPlaceholder();
    };

    const preserveHostShare = (message) => {
      if (!localStream) {
        closeForCriticalError(message);
        return;
      }

      console.warn(message);
      closeHostConnection();
      clearError();
      roomTitle.textContent = 'Ожидание зрителя';
      setRoomStatus(message);
      setConnectionStatus('waiting', 'Ожидание зрителя');
      setWebRTCStatus('waiting', 'Ожидание нового соединения');
      setShareState('active', 'Захват экрана активен. Ожидаем нового зрителя.');
      startShareButton.disabled = true;
      stopShareButton.disabled = false;
    };

    const closeForCriticalError = (message) => {
      if (role === 'host' && localStream) {
        preserveHostShare(message);
        return;
      }
      console.error(message);
      closeHostConnection();
      stopRemotePlayback(message);
      const streamToStop = localStream;
      localStream = null;
      streamToStop?.getTracks().forEach((track) => track.stop());
      localPreview.pause();
      localPreview.srcObject = null;
      localPreview.hidden = true;
      showVideoPlaceholder();
      startShareButton.disabled = true;
      stopShareButton.disabled = true;
      setShareState('error', message);
      setWebRTCStatus('error', 'Соединение потеряно');
      showError(message);
    };

    const stopSharing = (message = 'Трансляция остановлена') => {
      const streamToStop = localStream;
      const wasSharing = Boolean(streamToStop);
      localStream = null;
      closeHostConnection();

      streamToStop?.getTracks().forEach((track) => track.stop());
      localPreview.pause();
      localPreview.srcObject = null;
      localPreview.hidden = true;
      showVideoPlaceholder();
      startShareButton.disabled = false;
      stopShareButton.disabled = true;
      shareQualitySelect.disabled = false;
      setShareState('stopped', message);
      setWebRTCStatus('ended', 'Трансляция завершена');

      if (wasSharing && role === 'host' && socket?.connected) {
        socket.emit('stream-stopped', { message: 'Трансляция завершена.' });
      }
    };

    const createHostConnection = async (viewerId) => {
      if (!localStream || !viewerId || !viewerIds.has(viewerId) || hostConnections.has(viewerId)) return;

      await turnCredentialsPromise;
      if (!localStream || !viewerIds.has(viewerId) || hostConnections.has(viewerId)) return;
      if (!window.RTCPeerConnection) {
        closeForCriticalError('Ваш браузер не поддерживает WebRTC-трансляцию.');
        return;
      }

      let connection;
      try {
        connection = new RTCPeerConnection(rtcConfiguration);
      } catch (error) {
        console.error('Не удалось создать RTCPeerConnection ведущего:', error);
        setWebRTCStatus('error', 'Не удалось создать соединение со зрителем');
        return;
      }

      const entry = {
        connection,
        sessionId: createSessionId(),
        connectionTimeoutId: null,
        iceDisconnectTimeoutId: null
      };
      hostConnections.set(viewerId, entry);

      const isCurrent = () => hostConnections.get(viewerId) === entry;
      const startHostConnectionTimeout = () => {
        clearHostConnectionTimers(entry);
        entry.connectionTimeoutId = window.setTimeout(() => {
          if (isCurrent() && connection.connectionState !== 'connected' && connection.connectionState !== 'closed') {
            handleHostConnectionFailure(viewerId, 'Подключение к зрителю не удалось установить вовремя.');
          }
        }, WEBRTC_TIMEOUT_MS);
      };
      const startHostIceDisconnectTimeout = (message) => {
        window.clearTimeout(entry.iceDisconnectTimeoutId);
        entry.iceDisconnectTimeoutId = window.setTimeout(() => {
          if (isCurrent() && connection.connectionState === 'disconnected') {
            handleHostConnectionFailure(viewerId, message);
          }
        }, 5_000);
      };

      connection.onicecandidate = (event) => {
        if (event.candidate && isCurrent() && socket?.connected) {
          socket.emit('ice-candidate', {
            targetId: viewerId,
            sessionId: entry.sessionId,
            candidate: event.candidate.toJSON()
          });
        }
      };

      connection.onconnectionstatechange = () => {
        if (!isCurrent()) return;
        if (connection.connectionState === 'connected') {
          clearHostConnectionTimers(entry);
          setWebRTCStatus('active', roomConfig.maxViewers > 1 ? `Трансляция активна: ${hostConnections.size} соединений` : 'Трансляция активна');
          void updateRouteStatus(connection, viewerId);
        } else if (connection.connectionState === 'disconnected') {
          setWebRTCStatus('connecting', 'Соединение со зрителем нестабильно');
          startHostIceDisconnectTimeout('WebRTC-соединение со зрителем потеряно.');
        } else if (connection.connectionState === 'failed') {
          handleHostConnectionFailure(viewerId, 'WebRTC-соединение со зрителем потеряно.');
        }
      };

      connection.oniceconnectionstatechange = () => {
        if (!isCurrent()) return;
        console.info('Host ICE state:', connection.iceConnectionState);
        if (connection.iceConnectionState === 'checking') {
          setWebRTCStatus('connecting', 'Поиск сетевых маршрутов');
        } else if (connection.iceConnectionState === 'connected' || connection.iceConnectionState === 'completed') {
          window.clearTimeout(entry.iceDisconnectTimeoutId);
          entry.iceDisconnectTimeoutId = null;
          void updateRouteStatus(connection, viewerId);
        } else if (connection.iceConnectionState === 'disconnected') {
          startHostIceDisconnectTimeout('ICE-соединение со зрителем было разорвано.');
        } else if (connection.iceConnectionState === 'failed') {
          handleHostConnectionFailure(viewerId, 'Не удалось установить ICE-соединение со зрителем.');
        }
      };

      connection.onsignalingstatechange = () => {
        console.info('Host signaling state:', connection.signalingState);
      };

      try {
        localStream.getTracks().forEach((track) => connection.addTrack(track, localStream));
        const offer = await connection.createOffer();
        await connection.setLocalDescription(offer);

        if (isCurrent() && viewerIds.has(viewerId)) {
          setWebRTCStatus('connecting', 'Установка соединения');
          startHostConnectionTimeout();
          socket.emit('webrtc-offer', {
            targetId: viewerId,
            sessionId: entry.sessionId,
            sdp: connection.localDescription
          });
        }
      } catch (error) {
        console.error('Не удалось создать WebRTC offer:', error);
        if (isCurrent()) handleHostConnectionFailure(viewerId, 'Не удалось подготовить трансляцию для зрителя.');
      }
    };

    const startSharing = async () => {
      if (role !== 'host') return;

      if (!socket?.connected) {
        showError('Нет подключения к серверу. Сначала восстановите соединение с комнатой.');
        return;
      }

      if (!navigator.mediaDevices?.getDisplayMedia) {
        setShareState('error', 'Ваш браузер не поддерживает захват экрана.');
        showError('Ваш браузер не поддерживает захват экрана.');
        return;
      }

      clearError();
      startShareButton.disabled = true;
      shareQualitySelect.disabled = true;
      setShareState('requesting', 'Запрашиваем разрешение на захват экрана…');

      try {
        const quality = SHARE_QUALITY_PRESETS[shareQualitySelect.value] || SHARE_QUALITY_PRESETS.standard;
        // This call is only reached from the explicit button click above.
        const stream = await navigator.mediaDevices.getDisplayMedia({
          video: quality.video,
          audio: true
        });

        localStream = stream;
        localPreview.srcObject = stream;
        showVideo(localPreview);
        try {
          await localPreview.play();
        } catch (error) {
          console.warn('Автовоспроизведение локального видео заблокировано:', error);
          showError('Браузер не запустил предпросмотр автоматически. Нажмите кнопку воспроизведения на видео.');
        }

        const videoTrack = stream.getVideoTracks()[0];
        videoTrack?.addEventListener('ended', () => {
          if (localStream === stream) {
            stopSharing('Доступ к экрану был остановлен в браузере.');
          }
        });

        stopShareButton.disabled = false;
        setShareState('active', `${describeCapture(videoTrack)} Трансляция активна. Ожидаем или подключаем зрителя.`);
        setWebRTCStatus(viewerIds.size ? 'connecting' : 'waiting', viewerIds.size ? 'Установка соединений' : 'Ожидание зрителя');
        await Promise.all([...viewerIds].map((viewerId) => createHostConnection(viewerId)));
      } catch (error) {
        const streamToStop = localStream;
        localStream = null;
        streamToStop?.getTracks().forEach((track) => track.stop());
        localPreview.srcObject = null;
        localPreview.hidden = true;
        showVideoPlaceholder();
        startShareButton.disabled = false;
        stopShareButton.disabled = true;
        shareQualitySelect.disabled = false;

        console.error('Не удалось получить доступ к экрану:', error);

        if (error?.name === 'AbortError') {
          setShareState('error', 'Вы закрыли окно выбора экрана. Трансляция не началась.');
          showError('Вы закрыли окно выбора экрана. Когда будете готовы, нажмите «Начать трансляцию» ещё раз.');
          return;
        }

        if (error?.name === 'NotAllowedError') {
          setShareState('error', 'Доступ к экрану не предоставлен. Попробуйте ещё раз, когда будете готовы.');
          showError('Доступ к экрану не предоставлен. Захват запускается только после вашего выбора в системном окне браузера.');
          return;
        }

        setShareState('error', 'Не удалось начать захват экрана. Проверьте настройки браузера и повторите попытку.');
        showError('Не удалось начать захват экрана. Проверьте настройки браузера и повторите попытку.');
      }
    };

    const createViewerConnection = (sessionId) => {
      if (!window.RTCPeerConnection) {
        closeForCriticalError('Ваш браузер не поддерживает WebRTC-трансляцию.');
        return null;
      }

      let connection;
      try {
        connection = new RTCPeerConnection(rtcConfiguration);
      } catch (error) {
        console.error('Не удалось создать RTCPeerConnection зрителя:', error);
        closeForCriticalError('Не удалось создать WebRTC-соединение для просмотра.');
        return null;
      }
      viewerPeerConnection = connection;
      viewerSessionId = sessionId;

      connection.onicecandidate = (event) => {
        if (event.candidate && viewerPeerConnection === connection && socket?.connected) {
          socket.emit('ice-candidate', {
            sessionId,
            candidate: event.candidate.toJSON()
          });
        }
      };

      connection.ontrack = async (event) => {
        const [stream] = event.streams;
        if (!stream || viewerPeerConnection !== connection) return;

        remotePreview.srcObject = stream;
        showVideo(remotePreview);
        setRemoteStreamState('Трансляция активна.');
        setConnectionStatus('active', 'Трансляция активна');
        setWebRTCStatus('active', 'Трансляция активна');

        try {
          await remotePreview.play();
        } catch (error) {
          setRemoteStreamState('Трансляция получена. Нажмите воспроизведение, если браузер его заблокировал.');
        }
      };

      connection.onconnectionstatechange = () => {
        if (connection.connectionState === 'connecting') {
          setWebRTCStatus('connecting', 'Установка соединения');
        }

        if (connection.connectionState === 'connected') {
          clearConnectionTimeout();
          clearIceDisconnectTimeout();
          setWebRTCStatus('active', 'Трансляция активна');
          void updateRouteStatus(connection);
        }

        if (connection.connectionState === 'disconnected') {
          setWebRTCStatus('connecting', 'Соединение нестабильно, пытаемся восстановить');
          clearIceDisconnectTimeout();
          iceDisconnectTimeoutId = window.setTimeout(() => {
            if (connection.connectionState === 'disconnected') {
              closeForCriticalError('WebRTC-соединение с трансляцией потеряно.');
            }
          }, 5_000);
        }

        if (connection.connectionState === 'failed') {
          closeForCriticalError('WebRTC-соединение с трансляцией потеряно.');
        }
      };

      connection.oniceconnectionstatechange = () => {
        console.info('Viewer ICE state:', connection.iceConnectionState);
        if (connection.iceConnectionState === 'checking') {
          setWebRTCStatus('connecting', 'Поиск сетевого маршрута');
        }
        if (connection.iceConnectionState === 'connected' || connection.iceConnectionState === 'completed') {
          clearIceDisconnectTimeout();
          void updateRouteStatus(connection);
        }
        if (connection.iceConnectionState === 'disconnected') {
          clearIceDisconnectTimeout();
          iceDisconnectTimeoutId = window.setTimeout(() => {
            if (connection.iceConnectionState === 'disconnected') {
              closeForCriticalError('ICE-соединение с трансляцией было разорвано.');
            }
          }, 5_000);
        }
        if (connection.iceConnectionState === 'failed') {
          closeForCriticalError('Не удалось установить ICE-соединение с трансляцией.');
        }
      };

      connection.onsignalingstatechange = () => {
        console.info('Viewer signaling state:', connection.signalingState);
      };

      return connection;
    };

    if (!roomId) {
      roomTitle.textContent = 'Не указан код комнаты';
      setRoomStatus('Вернитесь на главную и создайте комнату или введите её код.');
      setConnectionStatus('error', 'Комната не указана');
      setWebRTCStatus('waiting', 'Недоступно');
      showError('Нужен корректный код комнаты.');
      return;
    }

    const roomUrl = new URL('/room.html', window.location.origin);
    roomUrl.searchParams.set('room', roomId);
    shareLink.value = roomUrl.toString();
    copyLinkButton.disabled = false;

    copyLinkButton.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(shareLink.value);
        copyLinkButton.textContent = i18n.getLocale?.() === 'en' ? 'COPIED' : 'СКОПИРОВАНО';
        i18n.showToast('info', i18n.getLocale?.() === 'en' ? 'Viewer link copied.' : 'Ссылка для зрителя скопирована.');
        window.setTimeout(() => { copyLinkButton.textContent = i18n.t('room.copy'); }, 1800);
      } catch (error) {
        try {
          shareLink.select();
          document.execCommand('copy');
          copyLinkButton.textContent = i18n.getLocale?.() === 'en' ? 'COPIED' : 'СКОПИРОВАНО';
          i18n.showToast('info', i18n.getLocale?.() === 'en' ? 'Viewer link copied.' : 'Ссылка для зрителя скопирована.');
          window.setTimeout(() => { copyLinkButton.textContent = i18n.t('room.copy'); }, 1800);
        } catch (fallbackError) {
          console.error('Не удалось скопировать ссылку:', fallbackError);
          showError('Не удалось скопировать ссылку. Выделите её и скопируйте вручную.');
        }
      }
    });

    updateShareQualityHint();
    shareQualitySelect.addEventListener('change', updateShareQualityHint);
    window.addEventListener('mirrised:localechange', updateShareQualityHint);
    startShareButton.addEventListener('click', startSharing);
    stopShareButton.addEventListener('click', () => stopSharing());

    socket = io({
      transports: ['websocket'],
      reconnectionAttempts: 5,
      reconnectionDelay: 1_000,
      reconnectionDelayMax: 5_000
    });
    const requestJoin = (pin = viewerPin) => {
      if (!isHostIntent) viewerPin = pin;
      socket.emit('join-room', {
        roomId,
        intent: isHostIntent ? 'host' : 'viewer',
        hostToken: isHostIntent ? hostToken : undefined,
        pin: isHostIntent ? undefined : pin
      });
    };

    const clearViewerRejoin = () => {
      window.clearTimeout(viewerRejoinTimer);
      viewerRejoinTimer = null;
      viewerRejoinAttempts = 0;
    };

    const scheduleViewerRejoin = () => {
      if (
        isHostIntent ||
        role !== 'viewer' ||
        !socket.connected ||
        viewerRejoinAttempts >= MAX_VIEWER_REJOIN_ATTEMPTS
      ) {
        return;
      }

      window.clearTimeout(viewerRejoinTimer);
      viewerRejoinAttempts += 1;
      viewerRejoinTimer = window.setTimeout(() => {
        if (socket.connected && role === 'viewer') requestJoin();
      }, 2_000);
    };

    socket.on('connect', () => {
      if (hasSocketConnected && role === 'viewer') {
        clearError();
        setRoomStatus('Восстанавливаем подключение к комнате…');
        setConnectionStatus('connecting', 'Восстанавливаем подключение');
        requestJoin();
      }
      hasSocketConnected = true;
    });
    requestJoin();

    pinForm.addEventListener('submit', (event) => {
      event.preventDefault();
      const pin = pinInput.value.trim();
      if (!/^\d{4,8}$/.test(pin)) {
        pinFeedback.textContent = 'Введите PIN из 4–8 цифр.';
        return;
      }
      submitPinButton.disabled = true;
      pinFeedback.textContent = 'Проверяем PIN-код…';
      requestJoin(pin);
    });

    leaveRoomButton.addEventListener('click', () => {
      leaveRoomButton.disabled = true;
      closeHostConnection();
      stopRemotePlayback('');
      const streamToStop = localStream;
      localStream = null;
      streamToStop?.getTracks().forEach((track) => track.stop());
      socket.disconnect();
      window.location.assign('/');
    });

    socket.on('room-created', async (config) => {
      role = 'host';
      setRoomConfig(config);
      pinForm.hidden = true;
      turnCredentialsPromise = loadTurnCredentials();
      await turnCredentialsPromise;
      hostControls.hidden = false;
      leaveRoomButton.disabled = false;
      setRole('host');
      clearError();
      roomTitle.textContent = 'Комната создана';
      setRoomStatus(`Вы ведущий. Режим: ${roomConfig.modeLabel}. До ${roomConfig.maxViewers} зрителей.`);
      setConnectionStatus('waiting', 'Ожидание зрителя');
      setWebRTCStatus('waiting', 'Ожидание зрителя');

      if (!navigator.mediaDevices?.getDisplayMedia) {
        startShareButton.disabled = true;
        setShareState('error', 'Ваш браузер не поддерживает захват экрана.');
        showError('Ваш браузер не поддерживает getDisplayMedia. Откройте комнату в современном браузере.');
      } else if (!window.RTCPeerConnection) {
        startShareButton.disabled = true;
        setShareState('error', 'Ваш браузер не поддерживает WebRTC.');
        showError('Ваш браузер не поддерживает WebRTC. Откройте комнату в современном браузере.');
      } else {
        startShareButton.disabled = false;
      }
    });

    socket.on('room-joined', async (config) => {
      role = 'viewer';
      setRoomConfig(config);
      clearViewerRejoin();
      pinForm.hidden = true;
      turnCredentialsPromise = loadTurnCredentials();
      await turnCredentialsPromise;
      viewerStream.hidden = false;
      leaveRoomButton.disabled = false;
      setRole('viewer');
      clearError();
      roomTitle.textContent = 'Вы подключились как зритель';
      setRoomStatus(`Ожидайте начала трансляции ведущим. Режим: ${roomConfig.modeLabel}.`);
      setConnectionStatus('waiting', 'Ожидание ведущего');
      setWebRTCStatus('waiting', 'Ожидание соединения');

      if (!window.RTCPeerConnection) {
        setWebRTCStatus('error', 'WebRTC не поддерживается');
        showError('Ваш браузер не поддерживает WebRTC. Откройте комнату в современном браузере.');
      }
    });

    socket.on('viewer-connected', async ({ viewerId, message, viewerCount, maxViewers }) => {
      if (!viewerId) return;
      viewerIds.add(viewerId);
      setRoomConfig({ viewerCount, maxViewers });
      clearError();
      roomTitle.textContent = roomConfig.maxViewers > 1 ? 'Зрители подключаются' : 'Зритель подключился';
      setRoomStatus(message);
      updateHostViewerStatus();
      if (!localStream) setWebRTCStatus('waiting', 'Ожидание трансляции');
      await createHostConnection(viewerId);
    });

    socket.on('viewer-disconnected', ({ viewerId, message, viewerCount, maxViewers }) => {
      if (viewerId) {
        viewerIds.delete(viewerId);
        closeHostConnection(viewerId);
      }
      setRoomConfig({ viewerCount, maxViewers });
      roomTitle.textContent = viewerIds.size ? 'Зрители подключены' : 'Ожидание зрителя';
      setRoomStatus(message);
      updateHostViewerStatus();
    });

    socket.on('host-disconnected', ({ message }) => {
      stopRemotePlayback('Трансляция завершена.');
      roomTitle.textContent = 'Трансляция завершена';
      setRoomStatus(message);
      setConnectionStatus('ended', 'Трансляция завершена');
      setWebRTCStatus('ended', 'Трансляция завершена');
    });

    socket.on('room-full', ({ message }) => {
      if (!isHostIntent && role === 'viewer') {
        clearError();
        roomTitle.textContent = 'Восстанавливаем подключение';
        setRoomStatus('Освобождаем прежнее подключение. Это обычно занимает несколько секунд.');
        setConnectionStatus('connecting', 'Ожидаем освобождения места');
        setWebRTCStatus('waiting', 'Ожидаем новое соединение');
        scheduleViewerRejoin();
        return;
      }
      roomTitle.textContent = 'Комната занята';
      setRoomStatus(message);
      setConnectionStatus('error', 'Подключение недоступно');
      showError(message);
    });

    socket.on('room-pin-required', ({ message }) => {
      pinForm.hidden = false;
      submitPinButton.disabled = false;
      pinFeedback.textContent = message;
      roomTitle.textContent = 'Введите PIN-код комнаты';
      setRoomStatus('Для подключения нужен PIN-код, который сообщил ведущий.');
      setConnectionStatus('waiting', 'Ожидание PIN-кода');
      pinInput.focus();
    });

    socket.on('room-pin-error', ({ message, blockedUntil }) => {
      pinForm.hidden = false;
      submitPinButton.disabled = Boolean(blockedUntil);
      pinFeedback.textContent = message;
      setConnectionStatus('error', blockedUntil ? 'Ввод PIN заблокирован' : 'PIN не подтверждён');
      showError(message);
      if (!blockedUntil) pinInput.focus();
    });

    socket.on('room-closed', ({ message }) => {
      closeForCriticalError(message);
      roomTitle.textContent = 'Комната закрыта';
      setRoomStatus(message);
      setConnectionStatus('ended', 'Комната завершена');
    });

    socket.on('room-error', ({ message }) => {
      roomTitle.textContent = 'Не удалось подключиться';
      setRoomStatus(message);
      setConnectionStatus('error', 'Ошибка подключения');
      showError(message);
    });

    socket.on('webrtc-offer', async ({ sessionId, sdp }) => {
      if (role !== 'viewer' || !sessionId || !sdp) return;

      await turnCredentialsPromise;

      stopRemotePlayback('Ожидаем трансляцию ведущего.');
      setWebRTCStatus('connecting', 'Установка соединения');
      const connection = createViewerConnection(sessionId);
      if (!connection) return;

      try {
        await connection.setRemoteDescription(sdp);
        await flushIceCandidates(connection, sessionId);
        const answer = await connection.createAnswer();
        await connection.setLocalDescription(answer);

        if (viewerPeerConnection === connection) {
          startConnectionTimeout(connection, 'Подключение к трансляции не удалось установить вовремя.');
          socket.emit('webrtc-answer', {
            sessionId,
            sdp: connection.localDescription
          });
        }
      } catch (error) {
        console.error('Не удалось обработать WebRTC offer:', error);
        if (viewerPeerConnection === connection) {
          stopRemotePlayback('Не удалось подключиться к трансляции ведущего.');
          setWebRTCStatus('error', 'Соединение потеряно');
          showError('Не удалось установить WebRTC-соединение с ведущим.');
        }
      }
    });

    socket.on('webrtc-answer', async ({ senderId, sessionId, sdp }) => {
      const entry = hostConnections.get(senderId);
      if (role !== 'host' || !entry || sessionId !== entry.sessionId || !sdp) return;

      try {
        await entry.connection.setRemoteDescription(sdp);
        await flushIceCandidates(entry.connection, sessionId);
      } catch (error) {
        console.error('Не удалось установить WebRTC answer:', error);
        handleHostConnectionFailure(senderId, 'Не удалось завершить WebRTC-подключение зрителя.');
      }
    });

    socket.on('ice-candidate', async ({ senderId, sessionId, candidate }) => {
      if (!sessionId || !candidate) return;

      if (role === 'host') {
        const entry = hostConnections.get(senderId);
        if (entry && sessionId === entry.sessionId) {
          await addIceCandidate(entry.connection, sessionId, candidate);
        }
      }

      if (role === 'viewer' && (!viewerSessionId || sessionId === viewerSessionId)) {
        await addIceCandidate(viewerPeerConnection, sessionId, candidate);
      }
    });

    socket.on('stream-stopped', () => {
      if (role !== 'viewer') return;
      stopRemotePlayback('Трансляция завершена.');
      roomTitle.textContent = 'Трансляция завершена';
      setConnectionStatus('ended', 'Трансляция завершена');
      setWebRTCStatus('ended', 'Трансляция завершена');
    });

    socket.on('connect_error', (error) => {
      console.error('Socket.IO connect error:', error);
      setRoomStatus('Нет подключения к серверу. Попробуйте обновить страницу.');
      setConnectionStatus('error', 'Соединение потеряно');
      showError('Нет подключения к серверу. Проверьте сеть и обновите страницу.');
    });

    socket.on('disconnect', (reason) => {
      console.warn('Socket.IO disconnected:', reason);
      if (!role) return;
      window.clearTimeout(viewerRejoinTimer);
      viewerRejoinTimer = null;
      closeForCriticalError('Соединение с сервером потеряно. Для продолжения откройте комнату заново.');
      setConnectionStatus('error', 'Соединение потеряно');
      setRoomStatus('Соединение с сервером потеряно. Автоматическое подключение ограничено.');
    });

    window.addEventListener('beforeunload', () => {
      window.clearTimeout(viewerRejoinTimer);
      clearConnectionTimeout();
      clearIceDisconnectTimeout();
      closeHostConnection();
      stopRemotePlayback('');
      localStream?.getTracks().forEach((track) => track.stop());
    });

    return;
  }

  const socket = io({
    transports: ['websocket'],
    reconnectionAttempts: 3,
    reconnectionDelay: 1_000,
    reconnectionDelayMax: 5_000
  });
  const createForm = document.querySelector('#create-room-form');
  const joinForm = document.querySelector('#join-room-form');
  const roomCodeInput = document.querySelector('#room-code');
  const createPinInput = document.querySelector('#room-pin-create');
  const createModeInput = document.querySelector('#room-mode-create');
  const createModeHint = document.querySelector('#room-mode-hint');
  const status = document.querySelector('#status');
  const createButton = createForm.querySelector('button[type="submit"]');
  const i18n = window.MirrisedI18n || { t: (key) => key, message: (value) => value };

  function setStatus(message) {
    status.textContent = i18n.message(message);
  }

  const roomModeHints = {
    direct: 'Только STUN: соединение не будет использовать TURN и может не установиться в закрытых сетях.',
    reliable: 'Надёжный режим подключается напрямую, а TURN используется только при необходимости.',
    group: 'До шести зрителей: ведущий отправляет отдельный поток каждому, поэтому нужна хорошая исходящая скорость.'
  };

  const updateRoomModeHint = () => {
    createModeHint.textContent = i18n.message(roomModeHints[createModeInput.value] || roomModeHints.reliable);
  };

  const modeSelect = document.querySelector('[data-mode-select]');
  const modeTrigger = document.querySelector('#room-mode-trigger');
  const modeValue = document.querySelector('#room-mode-value');
  const modeOptions = [...document.querySelectorAll('.mode-select-option')];

  const closeModeSelect = () => {
    if (!modeSelect || !modeTrigger) return;
    modeSelect.querySelector('.mode-select-options').hidden = true;
    modeTrigger.setAttribute('aria-expanded', 'false');
  };
  const syncModeSelect = () => {
    const selected = modeOptions.find((option) => option.dataset.modeValue === createModeInput.value) || modeOptions[0];
    if (!selected) return;
    modeValue.textContent = selected.querySelector('span')?.textContent || selected.textContent;
    modeOptions.forEach((option) => option.setAttribute('aria-selected', String(option === selected)));
    updateRoomModeHint();
  };
  const chooseMode = (mode) => {
    if (![...createModeInput.options].some((option) => option.value === mode)) return;
    createModeInput.value = mode;
    syncModeSelect();
  };

  createModeInput.addEventListener('change', syncModeSelect);
  modeTrigger?.addEventListener('click', () => {
    const options = modeSelect.querySelector('.mode-select-options');
    const willOpen = options.hidden;
    options.hidden = !willOpen;
    modeTrigger.setAttribute('aria-expanded', String(willOpen));
    if (willOpen) (modeOptions.find((option) => option.dataset.modeValue === createModeInput.value) || modeOptions[0])?.focus();
  });
  modeTrigger?.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') { closeModeSelect(); modeTrigger.focus(); }
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') { event.preventDefault(); modeTrigger.click(); }
  });
  modeOptions.forEach((option) => {
    option.addEventListener('click', () => { chooseMode(option.dataset.modeValue); closeModeSelect(); modeTrigger?.focus(); });
    option.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') { closeModeSelect(); modeTrigger?.focus(); }
      if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
        event.preventDefault();
        const index = modeOptions.indexOf(option);
        modeOptions[(index + (event.key === 'ArrowDown' ? 1 : modeOptions.length - 1)) % modeOptions.length]?.focus();
      }
    });
  });
  document.addEventListener('click', (event) => { if (modeSelect && !modeSelect.contains(event.target)) closeModeSelect(); });
  window.addEventListener('mirrised:localechange', syncModeSelect);
  syncModeSelect();

  const setCreateAvailability = (available) => {
    createButton.disabled = !available;
    createButton.textContent = available ? (i18n.getLocale?.() === 'en' ? 'CREATE ROOM' : 'СОЗДАТЬ КОМНАТУ') : i18n.t('home.create.loading');
  };

  setCreateAvailability(socket.connected);
  if (!socket.connected) setStatus('Подключаемся к серверу…');

  socket.on('connect', () => {
    setCreateAvailability(true);
    setStatus('');
  });

  socket.on('disconnect', () => {
    setCreateAvailability(false);
  });

  createForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const button = createButton;
    const pin = createPinInput.value.trim();
    const mode = createModeInput.value;
    if (pin && !/^\d{4,8}$/.test(pin)) {
      setStatus('PIN должен состоять из 4–8 цифр.');
      return;
    }
    button.disabled = true;
    setStatus('Создаём комнату…');

    if (!socket.connected) {
      button.disabled = false;
      setStatus('Нет соединения с сервером. Проверьте сеть и повторите попытку.');
      return;
    }

    socket.timeout(5_000).emit('create-room', { pin, mode }, (error, response) => {
      if (error || !response?.ok) {
        button.disabled = false;
        setStatus('Не удалось создать комнату. Попробуйте ещё раз.');
        return;
      }

      openRoom(response.roomId, true, response.hostToken);
    });
  });

  joinForm.addEventListener('submit', (event) => {
    event.preventDefault();
    openRoom(roomCodeInput.value.trim());
  });

  socket.on('connect_error', () => {
    setCreateAvailability(false);
    setStatus('Нет подключения к серверу. Проверьте соединение и повторите попытку.');
  });
  window.addEventListener('mirrised:localechange', () => {
    updateRoomModeHint();
    setCreateAvailability(socket.connected);
  });
})();
