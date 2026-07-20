# Mirrised

> Приватная трансляция экрана «один ведущий — один зритель» прямо в браузере.

Mirrised передаёт экран через WebRTC. Сервер нужен только для создания комнат,
проверки PIN-кода, выдачи временных TURN-учётных данных и обмена сигнальными
сообщениями. Он **не получает, не записывает и не хранит видеопоток**.

```text
┌───────────────┐      Socket.IO signalling       ┌──────────────────┐
│   Ведущий     │ ───────────────────────────────▶│  Mirrised / Node │
│ getDisplayMedia│◀───────────────────────────────│  комнаты + PIN   │
└───────┬───────┘                                  └──────────────────┘
        │
        │            WebRTC media (P2P)
        └──────────────────────────────────────────────┐
                                                       ▼
                                                ┌───────────────┐
                                                │    Зритель    │
                                                │  <video>      │
                                                └───────────────┘

Если прямой маршрут невозможен, трафик проходит через TURN (Coturn).
```

## Возможности

- одна одноразовая комната: один ведущий и один зритель;
- ведущий сам выбирает экран в системном диалоге браузера;
- необязательный PIN-код: в URL он не передаётся и на сервере хранится только хеш;
- WebRTC с STUN и короткоживущими TURN-учётными данными;
- адаптивный интерфейс, статусы подключения и понятные сообщения об ошибках;
- автоматическое завершение трансляции, очистка медиадорожек и `RTCPeerConnection`;
- временное состояние комнат только в памяти процесса — списка комнат и записи экрана нет.

## Как это работает

```text
1. Ведущий создаёт комнату                 2. Открывает персональную ссылку

   POST/Socket ACK                              /room.html?room=...&host=1&token=...
   ┌──────────┐                                  ┌────────────────────────────┐
   │ резерв   │ ── host token (в ссылке) ───────▶│ ведущий активирует комнату │
   └──────────┘                                  └────────────────────────────┘

3. Зритель получает ссылку без токена/PIN     4. Ведущий запускает показ вручную

   /room.html?room=...                            getDisplayMedia()
   ┌─────────────┐                                ┌────────────────────────────┐
   │ PIN, если   │ ──────────────────────────────▶│ браузер показывает chooser │
   │ он включён  │                                └────────────────────────────┘
   └─────────────┘
```

Токен ведущего находится только в его URL и служит для первой активации
зарезервированной комнаты. Ссылка для зрителя копируется отдельно — в ней нет
токена и PIN-кода. Не отправляйте ссылку ведущего другим людям.

## WebRTC-сигналинг

```text
Ведущий                    Сервер                    Зритель
   │                         │                          │
   │ viewer-connected         │                          │
   │◀────────────────────────│                          │
   │ createOffer()           │                          │
   │ webrtc-offer            │                          │
   │────────────────────────▶│─────────────────────────▶│ setRemoteDescription()
   │                         │                          │ createAnswer()
   │ webrtc-answer           │                          │
   │◀────────────────────────│◀─────────────────────────│
   │ setRemoteDescription()  │                          │
   │                         │                          │
   │ ice-candidate (в обе стороны, по мере появления)  │
   │◀───────────────────────▶│◀────────────────────────▶│
   │                         │                          │ ontrack → <video>
```

SDP и ICE-кандидаты сервер не разбирает. Он сверяет роль отправителя и комнату,
после чего пересылает сообщение только второму участнику этой же комнаты.

## Быстрый старт

Требуется Node.js 18 или новее.

```bash
git clone https://github.com/FArseniy/Mirrised.git
cd mirrised
npm install
copy .env.example .env
npm start
```

Откройте `http://localhost:3000`. Для `getDisplayMedia()` в браузере нужен
защищённый контекст: локальный `localhost` подходит для разработки, а публичный
сайт должен работать через HTTPS.

### Переменные окружения

```dotenv
PORT=3000
ALLOWED_ORIGINS=https://mirror.erised.click
STUN_URL=stun:stun.l.google.com:19302
TURN_URL=turn:trans.erised.click:3478?transport=udp,turns:trans.erised.click:5349?transport=tcp
TURN_SHARED_SECRET=replace-with-a-long-random-secret
```

Полный безопасный шаблон находится в [`.env.example`](.env.example). Файл `.env`
не должен попадать в Git. Постоянные `TURN_USERNAME` и `TURN_CREDENTIAL` в
клиентский JavaScript не передаются: приложение выдаёт действительные ограниченное
время учётные данные только участнику активной комнаты.

## Структура

```text
.
├── public/
│   ├── index.html              # создание и подключение к комнате
│   ├── room.html               # экран ведущего/зрителя
│   ├── style.css               # адаптивный интерфейс без фреймворков
│   └── app.js                  # UI, getDisplayMedia и WebRTC
├── test/
│   ├── helpers/socket.js       # клиенты Socket.IO для тестов
│   └── rooms.test.js           # комнаты, PIN, сигналинг, очистка
├── deploy/
│   ├── nginx/                  # reverse proxy и TLS-конфигурация
│   ├── systemd/                # service unit
│   └── coturn/                 # пример turnserver.conf
├── server.js                   # Express, Socket.IO и временное состояние
├── .env.example                # только шаблон, без секретов
├── TESTING.md                  # границы автоматического тестирования
└── package.json
```

## Безопасность

| Мера | От чего защищает |
| --- | --- |
| 128-битный `base64url` room ID | перебор активных комнат |
| Токен ведущего + одноразовая резервация | захват ещё не активированной комнаты |
| Хеш PIN через `scrypt` | раскрытие PIN при утечке памяти/логов |
| Лимит 5 неверных PIN и блокировка 15 минут | перебор PIN |
| Ровно два участника | лишние зрители и неопределённые роли |
| Строгий `Origin` и CORS | подключение Socket.IO со стороннего сайта |
| Лимиты размера, подключений, комнат и сигналов | переполнение памяти и простые DoS-атаки |
| Роли для offer/answer/stream-stopped | подмена направления сигналинга |
| Nginx переписывает `X-Forwarded-For` | обход rate limit через подставной IP |
| Helmet, CSP и `textContent` в UI | XSS, clickjacking и небезопасные заголовки |
| Очистка пустых, старых и неактивных комнат | накопление временного состояния |

Ограничения MVP: нет регистрации, постоянной истории, записи трансляций или
модерации. Это не замена корпоративному сервису с аудитом доступа.

## TURN / Coturn

TURN нужен, когда два браузера не могут установить прямое WebRTC-соединение из-за
NAT, мобильной или корпоративной сети. При маршруте `relay` видео проходит через
ваш TURN-сервер, поэтому расходуются его сеть и исходящий трафик.

```text
Прямой маршрут:  ведущий ───────────────────────────── зритель
TURN fallback:    ведущий ──▶ trans.erised.click ────▶ зритель
                              ^ весь медиатрафик ^
```

1. Установите Coturn на Ubuntu: `sudo apt update && sudo apt install coturn`.
2. Скопируйте [`deploy/coturn/turnserver.conf`](deploy/coturn/turnserver.conf) в
   `/etc/turnserver.conf`, укажите публичный IP и тот же `TURN_SHARED_SECRET`, что
   и в `/etc/mirrised/mirrised.env`.
3. Откройте TCP/UDP `3478`, TCP `5349` и relay-диапазон `49160:49200` TCP/UDP как
   в cloud firewall, так и в UFW.
4. Для `turns:` дайте Coturn доступ к TLS-сертификату домена `trans.erised.click`.
5. Проверьте звонок из двух разных сетей в `chrome://webrtc-internals`: выбранная
   пара с типом `relay` означает, что TURN действительно используется.

Подробные команды развёртывания и обновления приведены ниже.

## Тесты

```bash
npm test
```

Автоматические тесты используют стандартный `node:test` и `socket.io-client`.
Они проверяют HTTP health-check, формат room ID, Origin, лимит участников,
отключения ведущего и зрителя, замену зрителя, PIN-блокировку, роли сигналинга,
изоляцию комнат и очистку старых записей. Подробнее: [`TESTING.md`](TESTING.md).

Реальный захват экрана и TURN нужно дополнительно проверить вручную в двух
браузерах и двух сетях: системный диалог выбора экрана нельзя надёжно эмулировать
в headless-тесте.

## Production: Nginx + systemd + HTTPS

### 1. Установка приложения

```bash
sudo mkdir -p /opt/mirrised /etc/mirrised
sudo chown -R "$USER":"$USER" /opt/mirrised
# Скопируйте исходники в /opt/mirrised и создайте /etc/mirrised/mirrised.env.
cd /opt/mirrised
npm ci --omit=dev
sudo chown -R www-data:www-data /opt/mirrised
```

Установите unit [`deploy/systemd/mirrised.service`](deploy/systemd/mirrised.service):

```bash
sudo install -m 644 deploy/systemd/mirrised.service /etc/systemd/system/mirrised.service
sudo systemctl daemon-reload
sudo systemctl enable --now mirrised
sudo systemctl status mirrised
```

### 2. TLS и reverse proxy

Сначала установите ACME-конфигурацию Nginx, выпустите сертификаты, затем включите
основную конфигурацию. Готовые файлы: [`mirrised-acme.conf`](deploy/nginx/mirrised-acme.conf)
и [`mirrised.conf`](deploy/nginx/mirrised.conf).

```bash
sudo apt update && sudo apt install nginx certbot python3-certbot-nginx
sudo install -m 644 deploy/nginx/mirrised-acme.conf /etc/nginx/sites-available/mirrised
sudo ln -s /etc/nginx/sites-available/mirrised /etc/nginx/sites-enabled/mirrised
sudo nginx -t && sudo systemctl reload nginx

sudo certbot certonly --webroot -w /var/www/mirrised-acme -d mirror.erised.click
sudo certbot certonly --webroot -w /var/www/mirrised-acme -d trans.erised.click

sudo install -m 644 deploy/nginx/mirrised.conf /etc/nginx/sites-available/mirrised
sudo nginx -t && sudo systemctl reload nginx
```

Конфигурация уже включает WebSocket upgrade, длительные тайм-ауты для Socket.IO,
TLS 1.2/1.3, HSTS и безопасную передачу IP-адреса в rate limit.

### 3. Firewall

```bash
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 3478/tcp
sudo ufw allow 3478/udp
sudo ufw allow 5349/tcp
sudo ufw allow 49160:49200/tcp
sudo ufw allow 49160:49200/udp
sudo ufw status numbered
```

Не включайте UFW по SSH, пока не проверите правило для `22/tcp`.

### 4. Обновление

```bash
cd /opt/mirrised
git pull --ff-only
npm ci --omit=dev
node --check server.js
node --check public/app.js
sudo systemctl restart mirrised
curl -fsS https://mirror.erised.click/healthz
```

Никогда не заменяйте `/etc/mirrised/mirrised.env` содержимым репозитория.

## Проверка перед публикацией

- [ ] DNS `mirror.erised.click` и `trans.erised.click` указывает на сервер.
- [ ] `ALLOWED_ORIGINS` содержит только фактический HTTPS-домен приложения.
- [ ] В Git нет `.env`, сертификатов, PIN, SDP, токенов и `TURN_SHARED_SECRET`.
- [ ] `npm test` завершился успешно.
- [ ] `curl -fsS https://mirror.erised.click/healthz` возвращает `status: ok`.
- [ ] `sudo nginx -t` проходит без ошибок.
- [ ] `systemctl is-active mirrised nginx coturn` возвращает `active`.
- [ ] Ведущий и зритель проверены в разных браузерах; остановка экрана завершает показ.
- [ ] В `chrome://webrtc-internals` проверен хотя бы один маршрут через TURN `relay`.
- [ ] В cloud firewall открыт тот же relay-диапазон, что и в Coturn.

## Лицензия и вклад

Проект предназначен для приватного использования. Перед публикацией в открытый
доступ добавьте выбранную лицензию и правила обработки персональных данных,
соответствующие вашему региону и сценарию использования.
