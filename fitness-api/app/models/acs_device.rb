class AcsDevice < ApplicationRecord
  belongs_to :gym, optional: true

  has_many :acs_tokens, dependent: :destroy
  has_many :acs_events, dependent: :destroy
  has_many :acs_commands, dependent: :destroy

  enum :status, {
    unknown: "unknown",
    online: "online",
    offline: "offline"
  }

  validates :device_id, presence: true, uniqueness: true

  def self.ransackable_attributes(auth_object = nil)
    [
      "id",
      "device_id",
      "gym_id",
      "name",
      "status",
      "last_seen_at",
      "last_heartbeat_at",
      "last_net_status",
      "last_time_ok",
      "resync_in_progress",
      "resync_requested_at",
      "resync_started_at",
      "resync_completed_at",
      "resync_failed_at",
      "resync_error",
      "created_at",
      "updated_at"
    ]
  end

  def self.ransackable_associations(auth_object = nil)
    ["acs_tokens", "acs_events", "acs_commands", "gym"]
  end

  def topic_prefix
    "acs/#{device_id}"
  end

  def topic_for(suffix)
    Acs::Topic.for(device_id, suffix)
  end
end
