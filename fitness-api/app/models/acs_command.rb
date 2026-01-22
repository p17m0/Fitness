class AcsCommand < ApplicationRecord
  belongs_to :acs_device

  enum status: {
    queued: "queued",
    sent: "sent",
    acked: "acked",
    failed: "failed"
  }, _prefix: true

  validates :topic, :msg_id, :status, presence: true
  validates :payload, presence: true

  after_create_commit :enqueue_dispatch_job

  def mark_sent!
    update!(status: "sent", sent_at: Time.current)
  end

  def mark_ack!(ok:, reason: nil)
    update!(status: ok ? "acked" : "failed", ack_at: Time.current, ack_ok: ok, ack_reason: reason)
  end

  def mark_failed!(reason)
    update!(status: "failed", ack_at: Time.current, ack_ok: false, ack_reason: reason)
  end

  def payload_with_msg_id
    payload_hash = (payload.is_a?(Hash) ? payload : payload.to_h).deep_stringify_keys
    payload_hash["msg_id"] ||= msg_id
    payload_hash
  end

  private

  def enqueue_dispatch_job
    Acs::CommandDispatchJob.perform_later(id)
  end
end
