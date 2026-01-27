class AcsEvent < ApplicationRecord
  belongs_to :acs_device

  before_validation :normalize_uid
  before_validation :set_received_at, on: :create

  validates :event, :topic, :received_at, presence: true

  def self.ransackable_attributes(auth_object = nil)
    [
      "id",
      "acs_device_id",
      "event",
      "uid",
      "reader",
      "reason",
      "topic",
      "payload",
      "raw_payload",
      "ts",
      "received_at",
      "created_at",
      "updated_at"
    ]
  end

  def self.ransackable_associations(auth_object = nil)
    ["acs_device"]
  end

  private

  def normalize_uid
    self.uid = uid&.upcase
  end

  def set_received_at
    self.received_at ||= Time.current
  end
end
