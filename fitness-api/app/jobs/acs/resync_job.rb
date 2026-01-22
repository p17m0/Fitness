module Acs
  class ResyncJob < ApplicationJob
    queue_as :default

    def perform(acs_device_id, requested_by: "system")
      device = AcsDevice.find_by(id: acs_device_id)
      return if device.nil? || device.resync_in_progress?

      device.update!(
        resync_in_progress: true,
        resync_requested_at: Time.current,
        resync_started_at: Time.current,
        resync_error: nil
      )

      dispatch_and_wait(
        CommandBuilder.enqueue!(device: device, topic_suffix: "ctrl/resync/begin", payload: {})
      )

      device.acs_tokens.find_each do |token|
        dispatch_and_wait(
          CommandBuilder.enqueue!(
            device: device,
            topic_suffix: "ctrl/token/add",
            payload: token.to_add_payload
          )
        )
      end

      dispatch_and_wait(
        CommandBuilder.enqueue!(device: device, topic_suffix: "ctrl/resync/end", payload: {})
      )

      device.update!(resync_in_progress: false, resync_completed_at: Time.current)
    rescue StandardError => e
      device&.update!(
        resync_in_progress: false,
        resync_failed_at: Time.current,
        resync_error: "[#{requested_by}] #{e.class}: #{e.message}"
      )
      raise
    end

    private

    def dispatch_and_wait(command)
      Acs::CommandDispatchJob.perform_now(command.id)
      Acs::CommandTracker.wait_for_ack!(command)
    end
  end
end
