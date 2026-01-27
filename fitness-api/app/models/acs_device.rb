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

  def topic_prefix
    "acs/#{device_id}"
  end

  def topic_for(suffix)
    Acs::Topic.for(device_id, suffix)
  end
end
