require "mqtt"
require "openssl"

module Acs
  class MqttClient
    def self.connect
      ssl_options = if MqttConfig.insecure_ssl?
        { verify_mode: OpenSSL::SSL::VERIFY_NONE }
      else
        true
      end

      MQTT::Client.connect(
        host: MqttConfig.host,
        port: MqttConfig.port,
        ssl: ssl_options,
        cert_file: MqttConfig.cert_file,
        key_file: MqttConfig.key_file,
        ca_file: MqttConfig.ca_file,
        username: MqttConfig.username,
        password: MqttConfig.password,
        client_id: MqttConfig.client_id,
        keep_alive: MqttConfig.keep_alive
      ) do |client|
        yield client
      end
    end

    def self.publish(topic, payload, qos: MqttConfig.qos, retain: false)
      connect do |client|
        client.publish(topic, payload, retain, qos)
      end
    end
  end
end
