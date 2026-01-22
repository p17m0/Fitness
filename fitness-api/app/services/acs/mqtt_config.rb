module Acs
  class MqttConfig
    def self.host
      ENV.fetch("ACS_MQTT_HOST")
    end

    def self.port
      Integer(ENV.fetch("ACS_MQTT_PORT", "8883"))
    end

    def self.username
      ENV["ACS_MQTT_USERNAME"]
    end

    def self.password
      ENV["ACS_MQTT_PASSWORD"]
    end

    def self.client_id
      ENV.fetch("ACS_MQTT_CLIENT_ID", "fitness-api")
    end

    def self.ca_file
      ENV.fetch("ACS_MQTT_CA_FILE")
    end

    def self.cert_file
      ENV.fetch("ACS_MQTT_CERT_FILE")
    end

    def self.key_file
      ENV.fetch("ACS_MQTT_KEY_FILE")
    end

    def self.keep_alive
      Integer(ENV.fetch("ACS_MQTT_KEEPALIVE", "30"))
    end

    def self.ack_timeout
      Integer(ENV.fetch("ACS_MQTT_ACK_TIMEOUT", "10"))
    end

    def self.reconnect_delay
      Integer(ENV.fetch("ACS_MQTT_RECONNECT_DELAY", "1"))
    end

    def self.qos
      Integer(ENV.fetch("ACS_MQTT_QOS", "1"))
    end
  end
end
