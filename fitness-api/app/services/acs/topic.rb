module Acs
  class Topic
    PREFIX = "acs".freeze

    def self.for(device_id, suffix)
      "#{PREFIX}/#{device_id}/#{suffix}"
    end

    def self.parse(topic)
      parts = topic.split("/")
      return nil if parts.length < 3 || parts.first != PREFIX

      {
        device_id: parts[1],
        suffix: parts[2..].join("/")
      }
    end
  end
end
