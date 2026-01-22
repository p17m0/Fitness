module Acs
  class IncomingMessageProcessor
    def self.process(topic, raw_payload)
      parsed = Topic.parse(topic)
      return if parsed.nil?

      device = AcsDevice.find_or_create_by!(device_id: parsed[:device_id])
      device.update!(last_seen_at: Time.current)

      case parsed[:suffix]
      when "tele/log"
        handle_log(device, topic, raw_payload)
      when "tele/heartbeat"
        handle_heartbeat(device, topic, raw_payload)
      when "tele/log_debug"
        handle_debug(device, topic, raw_payload)
      when "ack"
        handle_ack(device, topic, raw_payload)
      when "ctrl/resync/request"
        handle_resync_request(device, topic, raw_payload)
      else
        create_event(device, topic: topic, event: "unknown_topic", raw_payload: raw_payload)
      end
    end

    def self.handle_log(device, topic, raw_payload)
      payload = parse_json(raw_payload)
      if payload.nil?
        create_event(device, topic: topic, event: "invalid_json", raw_payload: raw_payload)
        return
      end

      event_name = payload["event"].presence || "unknown"
      create_event(
        device,
        topic: topic,
        event: event_name,
        payload: payload,
        raw_payload: raw_payload,
        ts: payload["ts"],
        reader: payload["reader"],
        uid: payload["uid"],
        reason: payload["reason"]
      )

      device.update!(status: event_name == "acs_offline" ? "offline" : "online")
    end

    def self.handle_heartbeat(device, topic, raw_payload)
      payload = parse_json(raw_payload)
      if payload.nil?
        create_event(device, topic: topic, event: "invalid_json", raw_payload: raw_payload)
        return
      end

      device.update!(
        last_heartbeat_at: Time.current,
        last_time_ok: payload["time_ok"],
        last_net_status: payload["net"],
        status: "online"
      )

      create_event(
        device,
        topic: topic,
        event: "heartbeat",
        payload: payload,
        raw_payload: raw_payload,
        ts: payload["ts"]
      )
    end

    def self.handle_debug(device, topic, raw_payload)
      create_event(
        device,
        topic: topic,
        event: "log_debug",
        raw_payload: raw_payload
      )
    end

    def self.handle_ack(device, topic, raw_payload)
      payload = parse_json(raw_payload)
      if payload.nil?
        create_event(device, topic: topic, event: "ack_invalid_json", raw_payload: raw_payload)
        return
      end

      msg_id = payload["msg_id"]
      if msg_id.blank?
        create_event(device, topic: topic, event: "ack_missing_msg_id", payload: payload, raw_payload: raw_payload)
        return
      end

      command = device.acs_commands.order(created_at: :desc).find_by(msg_id: msg_id)
      if command.nil?
        create_event(device, topic: topic, event: "ack_unknown_msg_id", payload: payload, raw_payload: raw_payload)
        return
      end

      command.mark_ack!(ok: payload["ok"], reason: payload["reason"])
    end

    def self.handle_resync_request(device, topic, raw_payload)
      payload = parse_json(raw_payload)
      if payload.nil?
        create_event(device, topic: topic, event: "resync_invalid_json", raw_payload: raw_payload)
        return
      end

      if payload["action"] == "request"
        device.update!(resync_requested_at: Time.current)
        create_event(device, topic: topic, event: "resync_requested", payload: payload, raw_payload: raw_payload)
        Acs::ResyncJob.perform_later(device.id, requested_by: "device")
      else
        create_event(device, topic: topic, event: "resync_unknown_action", payload: payload, raw_payload: raw_payload)
      end
    end

    def self.parse_json(raw_payload)
      JSON.parse(raw_payload)
    rescue JSON::ParserError
      nil
    end

    def self.create_event(device, attrs)
      AcsEvent.create!(
        {
          acs_device: device,
          received_at: Time.current
        }.merge(attrs)
      )
    end

    private_class_method :handle_log, :handle_heartbeat, :handle_debug, :handle_ack, :handle_resync_request,
                         :parse_json, :create_event
  end
end
