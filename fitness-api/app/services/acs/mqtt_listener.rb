module Acs
  class MqttListener
    SUBSCRIPTIONS = [
      "acs/+/tele/log",
      "acs/+/tele/heartbeat",
      "acs/+/tele/log_debug",
      "acs/+/ack",
      "acs/+/ctrl/resync/request"
    ].freeze

    def run!
      loop do
        MqttClient.connect do |client|
          client.subscribe(*subscriptions)
          client.get do |topic, message|
            IncomingMessageProcessor.process(topic, message)
          rescue StandardError => e
            Rails.logger.error("ACS MQTT message error: #{e.class}: #{e.message}")
          end
        end
      rescue StandardError => e
        Rails.logger.error("ACS MQTT connection error: #{e.class}: #{e.message}")
        sleep MqttConfig.reconnect_delay
      end
    end

    private

    def subscriptions
      SUBSCRIPTIONS.map { |topic| [topic, MqttConfig.qos] }
    end
  end
end
