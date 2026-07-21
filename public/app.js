(() => {
  const roomIdOutput = document.querySelector('#room-id');
  const DEFAULT_RTC_CONFIGURATION = {
    iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
  };
  const WEBRTC_TIMEOUT_MS = 20_000;
  const MAX_PENDING_ICE_CANDIDATES = 128;

  function openRoom(roomId, isHost = false, hostToken = '') {
    const params = new URLSearchParams({ room: roomId });
    if (isHost) {
      params.set('host', '1');
      params.set('token', hostToken);
    }
    window.location.assign(`/room.html?${params.toString()}`);
  }

  if (roomIdOutput) {
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
    let viewerConnected = false;
    let localStream = null;
    let hostPeerConnection = null;
    let viewerPeerConnection = null;
    let hostSessionId = null;
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
    const pendingIceCandidates = new Map();

    roomIdOutput.textContent = roomId || 'Не указан';

    const setRoomStatus = (message) => {
      roomStatus.textContent = message;
    };

    const setConnectionStatus = (status, message) => {
      connectionStatusCard.dataset.status = status;
      connectionStatus.textContent = message;
    };

    const setWebRTCStatus = (status, message) => {
      webrtcStatusCard.dataset.status = status;
      webrtcStatus.textContent = message;
    };

    const setRouteStatus = (route, message) => {
      routeStatusCard.dataset.route = route;
      routeStatus.textContent = message;
    };

    const updateRouteStatus = async (connection) => {
      if (!connection || connection.connectionState === 'closed') {
        setRouteStatus('waiting', 'Определится после подключения');
        return;
      }

      setRouteStatus('detecting', 'Определяем маршрут…');
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
          setRouteStatus('waiting', 'Маршрут пока не определён');
          return;
        }

        const localCandidate = stats.get(candidatePair.localCandidateId);
        const remoteCandidate = stats.get(candidatePair.remoteCandidateId);
        const usesRelay = localCandidate?.candidateType === 'relay' || remoteCandidate?.candidateType === 'relay';
        setRouteStatus(usesRelay ? 'relay' : 'p2p', usesRelay ? 'Через TURN-сервер' : 'P2P напрямую');
      } catch (error) {
        console.warn('Unable to determine the selected WebRTC route:', error);
        setRouteStatus('waiting', 'Маршрут не удалось определить');
      }
    };

    const setRole = (nextRole) => {
      roleLabel.dataset.role = nextRole || 'pending';
      roleLabel.textContent = nextRole === 'host'
        ? 'Роль: ведущий'
        : nextRole === 'viewer'
          ? 'Роль: зритель'
          : 'Роль: ожидание';
    };

    const showError = (message) => {
      errorBox.textContent = message;
      errorBox.hidden = false;
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
      shareState.textContent = message;
    };

    const setRemoteStreamState = (message) => {
      remoteStreamState.textContent = message;
    };

    const loadTurnCredentials = () => new Promise((resolve) => {
      const timeoutId = window.setTimeout(resolve, 5_000);
      socket.emit('get-turn-credentials', (response) => {
        window.clearTimeout(timeoutId);
        if (response?.ok && Array.isArray(response.iceServers) && response.iceServers.length) {
          rtcConfiguration = { iceServers: response.iceServers };
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
        if (connection === hostPeerConnection) {
          preserveHostShare('Подключение к зрителю заняло слишком много времени.');
          return;
        }
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

    const closeHostConnection = () => {
      clearConnectionTimeout();
      clearIceDisconnectTimeout();
      setRouteStatus('waiting', 'Определится после подключения');
      const sessionId = hostSessionId;
      hostSessionId = null;
      pendingIceCandidates.delete(sessionId);

      if (!hostPeerConnection) return;
      hostPeerConnection.onicecandidate = null;
      hostPeerConnection.onconnectionstatechange = null;
      hostPeerConnection.oniceconnectionstatechange = null;
      hostPeerConnection.onsignalingstatechange = null;
      hostPeerConnection.close();
      hostPeerConnection = null;
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
      viewerConnected = false;
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
      setShareState('stopped', message);
      setWebRTCStatus('ended', 'Трансляция завершена');

      if (wasSharing && role === 'host' && socket?.connected) {
        socket.emit('stream-stopped', { message: 'Трансляция завершена.' });
      }
    };

    const createHostConnection = async () => {
      if (!localStream || !viewerConnected || hostPeerConnection) return;

      await turnCredentialsPromise;

      if (!window.RTCPeerConnection) {
        closeForCriticalError('Ваш браузер не поддерживает WebRTC-трансляцию.');
        return;
      }

      let connection;
      try {
        connection = new RTCPeerConnection(rtcConfiguration);
      } catch (error) {
        console.error('Не удалось создать RTCPeerConnection ведущего:', error);
        closeForCriticalError('Не удалось создать WebRTC-соединение для трансляции.');
        return;
      }
      const sessionId = createSessionId();
      hostPeerConnection = connection;
      hostSessionId = sessionId;

      connection.onicecandidate = (event) => {
        if (event.candidate && hostPeerConnection === connection && socket?.connected) {
          socket.emit('ice-candidate', {
            sessionId,
            candidate: event.candidate.toJSON()
          });
        }
      };

      connection.onconnectionstatechange = () => {
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
              closeForCriticalError('WebRTC-соединение со зрителем потеряно.');
            }
          }, 5_000);
        }

        if (connection.connectionState === 'failed') {
          closeForCriticalError('WebRTC-соединение со зрителем потеряно.');
        }
      };

      connection.oniceconnectionstatechange = () => {
        console.info('Host ICE state:', connection.iceConnectionState);
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
              closeForCriticalError('ICE-соединение со зрителем было разорвано.');
            }
          }, 5_000);
        }
        if (connection.iceConnectionState === 'failed') {
          closeForCriticalError('Не удалось установить ICE-соединение со зрителем.');
        }
      };

      connection.onsignalingstatechange = () => {
        console.info('Host signaling state:', connection.signalingState);
      };

      try {
        localStream.getTracks().forEach((track) => connection.addTrack(track, localStream));
        const offer = await connection.createOffer();
        await connection.setLocalDescription(offer);

        if (hostPeerConnection === connection && viewerConnected) {
          setWebRTCStatus('connecting', 'Установка соединения');
          startConnectionTimeout(connection, 'Подключение к зрителю не удалось установить вовремя.');
          socket.emit('webrtc-offer', {
            sessionId,
            sdp: connection.localDescription
          });
        }
      } catch (error) {
        console.error('Не удалось создать WebRTC offer:', error);
        if (hostPeerConnection === connection) {
          closeForCriticalError('Не удалось подготовить трансляцию для зрителя.');
        }
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
      setShareState('requesting', 'Запрашиваем разрешение на захват экрана…');

      try {
        // This call is only reached from the explicit button click above.
        const stream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
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
        setShareState('active', 'Трансляция активна. Ожидаем или подключаем зрителя.');
        setWebRTCStatus(viewerConnected ? 'connecting' : 'waiting', viewerConnected ? 'Установка соединения' : 'Ожидание зрителя');
        await createHostConnection();
      } catch (error…531 tokens truncated…я:', error);
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
        copyLinkButton.textContent = 'Скопировано';
        window.setTimeout(() => { copyLinkButton.textContent = 'Копировать'; }, 1800);
      } catch (error) {
        try {
          shareLink.select();
          document.execCommand('copy');
          copyLinkButton.textContent = 'Скопировано';
          window.setTimeout(() => { copyLinkButton.textContent = 'Копировать'; }, 1800);
        } catch (fallbackError) {
          console.error('Не удалось скопировать ссылку:', fallbackError);
          showError('Не удалось скопировать ссылку. Выделите её и скопируйте вручную.');
        }
      }
    });

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

    socket.on('room-created', async () => {
      role = 'host';
      pinForm.hidden = true;
      turnCredentialsPromise = loadTurnCredentials();
      await turnCredentialsPromise;
      hostControls.hidden = false;
      leaveRoomButton.disabled = false;
      setRole('host');
      clearError();
      roomTitle.textContent = 'Комната создана';
      setRoomStatus('Вы ведущий. Отправьте эту ссылку или код зрителю.');
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

    socket.on('room-joined', async () => {
      role = 'viewer';
      clearViewerRejoin();
      pinForm.hidden = true;
      turnCredentialsPromise = loadTurnCredentials();
      await turnCredentialsPromise;
      viewerStream.hidden = false;
      leaveRoomButton.disabled = false;
      setRole('viewer');
      clearError();
      roomTitle.textContent = 'Вы подключились как зритель';
      setRoomStatus('Ожидайте начала трансляции ведущим.');
      setConnectionStatus('waiting', 'Ожидание ведущего');
      setWebRTCStatus('waiting', 'Ожидание соединения');

      if (!window.RTCPeerConnection) {
        setWebRTCStatus('error', 'WebRTC не поддерживается');
        showError('Ваш браузер не поддерживает WebRTC. Откройте комнату в современном браузере.');
      }
    });

    socket.on('viewer-connected', async ({ message }) => {
      viewerConnected = true;
      clearError();
      roomTitle.textContent = 'Зритель подключился';
      setRoomStatus(message);
      setConnectionStatus('active', 'Зритель подключён');
      setWebRTCStatus(localStream ? 'connecting' : 'waiting', localStream ? 'Установка соединения' : 'Ожидание трансляции');
      await createHostConnection();
    });

    socket.on('viewer-disconnected', ({ message }) => {
      viewerConnected = false;
      closeHostConnection();
      setWebRTCStatus('waiting', 'Ожидание нового зрителя');
      roomTitle.textContent = 'Ожидание зрителя';
      setRoomStatus(message);
      setConnectionStatus('waiting', 'Ожидание зрителя');
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

    socket.on('webrtc-answer', async ({ sessionId, sdp }) => {
      if (role !== 'host' || sessionId !== hostSessionId || !sdp || !hostPeerConnection) return;

      try {
        await hostPeerConnection.setRemoteDescription(sdp);
        await flushIceCandidates(hostPeerConnection, sessionId);
      } catch (error) {
        console.error('Не удалось установить WebRTC answer:', error);
        closeForCriticalError('Не удалось завершить WebRTC-подключение зрителя.');
      }
    });

    socket.on('ice-candidate', async ({ sessionId, candidate }) => {
      if (!sessionId || !candidate) return;

      if (role === 'host' && sessionId === hostSessionId) {
        await addIceCandidate(hostPeerConnection, sessionId, candidate);
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
  const status = document.querySelector('#status');
  const createButton = createForm.querySelector('button');

  function setStatus(message) {
    status.textContent = message;
  }

  const setCreateAvailability = (available) => {
    createButton.disabled = !available;
    createButton.textContent = available ? 'Создать комнату' : 'Подключаемся…';
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

    socket.timeout(5_000).emit('create-room', { pin }, (error, response) => {
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
})();
