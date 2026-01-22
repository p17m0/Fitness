namespace :acs do
  namespace :mqtt do
    desc "Start ACS MQTT listener"
    task listen: :environment do
      Acs::MqttListener.new.run!
    end
  end
end
