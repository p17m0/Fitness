class AcsToken < ApplicationRecord
  TOKEN_FIELDS = %w[uid valid_from valid_to day_start_s day_end_s remaining_uses version acs_device_id].freeze

  belongs_to :acs_device
  belongs_to :client, optional: true
  belongs_to :booking

  before_validation :normalize_uid

  validates :uid, presence: true, format: { with: /\A[0-9A-F]{8}\z/ }
  validates :valid_from, :valid_to, :day_start_s, :day_end_s, :remaining_uses, :version, presence: true
  validates :remaining_uses, numericality: { greater_than_or_equal_to: 0 }
  # validates :day_start_s, :day_end_s, numericality: { greater_than_or_equal_to: 0, less_than_or_equal_to: 86_399 }
  validate :validity_ranges

  after_commit :enqueue_add_command, on: [:create, :update]
  after_commit :enqueue_remove_command, on: :destroy

  def to_add_payload
    {
      uid: uid,
      valid_from: valid_from,
      valid_to: valid_to,
      day_start_s: day_start_s,
      day_end_s: day_end_s,
      remaining_uses: remaining_uses,
      version: version
    }
  end

  private

  def normalize_uid
    self.uid = uid&.upcase
  end

  def validity_ranges
    if valid_from.present? && valid_to.present? && valid_to <= valid_from
      errors.add(:valid_to, "must be greater than valid_from")
    end

    if day_start_s.present? && day_end_s.present? && day_end_s < day_start_s
      errors.add(:day_end_s, "must be greater than or equal to day_start_s")
    end
  end

  def enqueue_add_command
    return if (previous_changes.keys & TOKEN_FIELDS).empty?
    if saved_change_to_acs_device_id?
      old_device_id, _new_device_id = saved_change_to_acs_device_id
      old_device = AcsDevice.find_by(id: old_device_id)
      if old_device.present?
        Acs::CommandBuilder.enqueue!(device: old_device, topic_suffix: "ctrl/token/remove", payload: { uid: uid })
      end
    end
    Acs::CommandBuilder.enqueue!(device: acs_device, topic_suffix: "ctrl/token/add", payload: to_add_payload)
  end

  def enqueue_remove_command
    Acs::CommandBuilder.enqueue!(device: acs_device, topic_suffix: "ctrl/token/remove", payload: { uid: uid })
  end
end
