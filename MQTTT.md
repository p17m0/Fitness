# MQTT протокол ACS (ESP32) — для серверной части

Документ описывает MQTT-интерфейс устройства из `mqtt_mgr.c`: топики, обязательные поля, ответы (ACK), ограничения.

## 1) База топиков

Base topic устройства:

- acs/<device_id>

где <device_id> = CONFIG_ACS_DEVICE_ID.

Пример, если device_id = acs-zh:

- acs/acs-zh/ctrl/token/add
- acs/acs-zh/tele/heartbeat

## 2) Общие правила

### 2.1 QoS

- Управление (acs/<id>/ctrl/...): подписка QoS=1
- ACK (acs/<id>/ack): публикация QoS=1
- Heartbeat (acs/<id>/tele/heartbeat): QoS=0
- Логи (acs/<id>/tele/log): QoS=1
- Debug логи (acs/<id>/tele/log_debug): QoS=1 (если включено)

### 2.2 Retain на ctrl-топиках запрещён

Если сервер отправил сообщение с retain=1 на любой acs/<id>/ctrl/...:

- команда не выполняется
- устройство отвечает NACK: retain_not_allowed

### 2.3 msg_id обязателен для всех команд

Каждое сообщение на должно содержать поле "msg_id".

Если msg_id отсутствует:

- устройство ACK не отправляет
- пишет локальный лог missing_msg_id

## 3) Ответы ACK (device → server)

### 3.1 Топик ACK

- acs/<id>/ack

Успех:

    {"msg_id":"door-0001","ok":true}

Ошибка:

    {"msg_id":"door-0001","ok":false,"reason":"stale_ts"}

reason бывает:

- кастомные строки (retain_not_allowed, stale_ts, ...)
- или ESP_ERR_* строка из esp_err_to_name() (что вернул обработчик)

## 4) Топики управления (server → device)

Все команды публикуются сервером в acs/<id>/ctrl/..., ответы читаются из acs/<id>/ack.

### 4.1 Токены

#### 4.1.1 acs/<id>/ctrl/token/add

Добавить токен (плоская схема, как используется у нас):

    {
      "msg_id": "2fac3606e655",
      "uid": "A591A3BD",
      "valid_from": 0,
      "valid_to": -1,
      "day_start_s": 0,
      "day_end_s": 86399,
      "remaining_uses": 1,
      "version": 1
    }

ACK (пример):

    {"msg_id":"2fac3606e655","ok":true}

#### 4.1.2 acs/<id>/ctrl/token/update

Обновить токен (пример):

    {
      "msg_id": "upd-0001",
      "uid": "A591A3BD",
      "remaining_uses": 5,
      "version": 2
    }

ACK:

    {"msg_id":"upd-0001","ok":true}

#### 4.1.3 acs/<id>/ctrl/token/remove

Удалить токен:

    {
      "msg_id": "rm-0001",
      "uid": "A591A3BD"
    }

#### 4.1.4 acs/<id>/ctrl/token/wipe

Стереть все токены:

    {
      "msg_id": "wipe-0001",
      "confirm": true
    }

#### 4.1.5 acs/<id>/ctrl/token/stats

Запрос статистики:

    {
      "msg_id": "stats-0001"
    }

Важно: mqtt_mgr.c не определяет отдельный топик/формат для ответа со статистикой.
Если нужно вернуть числа — это делает обработчик (обычно через tele/log или отдельный новый топик).

### 4.2 Конфиг

#### acs/<id>/ctrl/config

Пример:

    {
      "msg_id": "cfg-0001",
      "door_open_ms": 3000
    }

### 4.3 Дверь (anti-replay)

#### acs/<id>/ctrl/door

Обязательные поля:

- msg_id
- ts (unix epoch seconds; можно числом или строкой "123")

Требования безопасности:

- устройство должно иметь валидное время (time_ok=true), иначе time_not_valid
- abs(now - ts) <= 30 секунд, иначе stale_ts
- нельзя переиспользовать msg_id с другим ts → msg_id_reuse

Пример команды:

    {
      "msg_id": "door-0001",
      "ts": 1769040900,
      "action": "unlock",
      "door": 1,
      "pulse_ms": 3000
    }

Типовые NACK причины:

    {"msg_id":"door-0001","ok":false,"reason":"time_not_valid"}
    {"msg_id":"door-0001","ok":false,"reason":"missing_ts"}
    {"msg_id":"door-0001","ok":false,"reason":"stale_ts"}
    {"msg_id":"door-0001","ok":false,"reason":"retain_not_allowed"}
    {"msg_id":"door-0001","ok":false,"reason":"msg_id_reuse"}

### 4.4 Resync

Поддерживаемые топики:

- acs/<id>/ctrl/resync (legacy — трактуется как begin)
- acs/<id>/ctrl/resync/begin
- acs/<id>/ctrl/resync/end
- acs/<id>/ctrl/resync/request

Рекомендуемый серверный сценарий ресинка:

1) сервер → устройство: ctrl/resync/begin
2) сервер → устройство: много ctrl/token/add и/или ctrl/token/update (обычно по 1 токену)
3) сервер → устройство: ctrl/resync/end

Примеры begin/end:

    {"msg_id":"rs-begin-1"}
    {"msg_id":"rs-end-1"}

## 5) Телеметрия (device → server)

### 5.1 Heartbeat

Топик:

- acs/<id>/tele/heartbeat (QoS0)

Пример:

    {
      "ts": 1769040833,
      "uptime_ms": 364979,
      "net": "up",
      "time_ok": true,
      "reader_seen": true,
      "reader_ok": true,
      "reader_age_ms": 5339,
      "reader_id": 1
    }

### 5.2 Логи

Топик:

- acs/<id>/tele/log (QoS1)

Туда уходят JSON-строки логов (как формирует log_buf).
Last Will (LWT) тоже публикуется в этот топик:

    {"event":"acs_offline"}

### 5.3 Debug логи (опционально)

Топик:

- acs/<id>/tele/log_debug (QoS1)

Содержимое: сырые строки логов (не обязательно JSON).

### 5.4 Статус online/offline

Топики:

- acs/<id>/status/online
- acs/<id>/status/offline

Сообщения приходят как приветствие при подключении и как LWT при отключении.

## 6) Можно ли отправлять много токенов в одном сообщении?

mqtt_mgr.c сам по себе это не запрещает, но:

- устройство возвращает один ACK на один msg_id
- поэтому без расширения протокола вы не получите per-token результат

Рекомендация при текущем дизайне: отправлять много сообщений ctrl/token/add (по 1 токену), это идеально ложится на существующий ACK.


    {
      "msg_id": "batch-0001",
      "tokens": [
        {"uid":"A591A3BD","valid_from":0,"valid_to":-1,"day_start_s":0,"day_end_s":86399,"remaining_uses":1,"version":1},
      ]
    }
