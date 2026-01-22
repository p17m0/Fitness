module Acs
  class CommandTimeoutJob < ApplicationJob
    queue_as :default

    def perform(command_id)
      command = AcsCommand.find_by(id: command_id)
      return if command.nil? || !command.status_sent? || command.ack_at.present?

      command.mark_failed!("ack_timeout")
    end
  end
end
