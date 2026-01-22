module Acs
  class CommandBuilder
    def self.enqueue!(device:, topic_suffix:, payload:)
      payload = payload.deep_stringify_keys
      msg_id = payload["msg_id"] || MessageId.generate(topic_suffix.tr("/", "-"))
      payload = payload.merge("msg_id" => msg_id)

      AcsCommand.create!(
        acs_device: device,
        topic: Topic.for(device.device_id, topic_suffix),
        msg_id: msg_id,
        payload: payload,
        status: "queued"
      )
    end
  end
end
