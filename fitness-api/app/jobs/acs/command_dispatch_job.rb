module Acs
  class CommandDispatchJob < ApplicationJob
    queue_as :default

    def perform(command_id)
      command = AcsCommand.find_by(id: command_id)
      return if command.nil? || !command.status_queued?

      payload = command.payload_with_msg_id
      command.update!(payload: payload) if payload != command.payload

      MqttClient.publish(command.topic, payload.to_json)
      command.mark_sent!
      Acs::CommandTimeoutJob.set(wait: MqttConfig.ack_timeout.seconds).perform_later(command.id)
    rescue StandardError => e
      if command.present?
        command.increment!(:retries)
        command.mark_failed!("publish_error: #{e.class}")
      end
      raise
    end
  end
end
