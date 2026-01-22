module Acs
  class CommandTracker
    AckTimeoutError = Class.new(StandardError)
    AckFailedError = Class.new(StandardError)

    def self.wait_for_ack!(command, timeout: MqttConfig.ack_timeout, poll_interval: 0.2)
      start_time = Time.current
      loop do
        command.reload
        return true if command.status_acked?
        raise AckFailedError, command.ack_reason if command.status_failed?

        if Time.current - start_time > timeout
          command.mark_failed!("ack_timeout") if command.status_sent?
          raise AckTimeoutError, "ACK timeout for #{command.msg_id}"
        end

        sleep poll_interval
      end
    end
  end
end
