module Acs
  class DeviceOfflineJob < ApplicationJob
    queue_as :default

    def perform
      cutoff = Time.current - MqttConfig.device_offline_after.seconds

      AcsDevice.where.not(last_heartbeat_at: nil)
               .where("last_heartbeat_at < ?", cutoff)
               .where.not(status: "offline")
               .find_each do |device|
        device.update!(status: "offline")
      end
    end
  end
end
module Acs
  class DeviceOfflineJob < ApplicationJob
    queue_as :default

    def perform
      cutoff = Time.current - MqttConfig.device_offline_after.seconds

      AcsDevice.where.not(last_heartbeat_at: nil)
               .where("last_heartbeat_at < ?", cutoff)
               .where.not(status: "offline")
               .find_each do |device|
        device.update!(status: "offline")
      end
    end
  end
end
