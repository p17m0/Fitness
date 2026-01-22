class AcsEvent < ApplicationRecord
  belongs_to :acs_device

  before_validation :normalize_uid
  before_validation :set_received_at, on: :create

  validates :event, :topic, :received_at, presence: true

  private

  def normalize_uid
    self.uid = uid&.upcase
  end

  def set_received_at
    self.received_at ||= Time.current
  end
end
