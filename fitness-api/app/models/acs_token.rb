class AcsToken < ApplicationRecord
  TOKEN_FIELDS = %w[uid valid_from valid_to day_start_s day_end_s remaining_uses version acs_device_id].freeze
  MIN_UNIX_TS = 1_000_000_000

  belongs_to :acs_device
  belongs_to :client, optional: true
  belongs_to :booking

  before_validation :normalize_uid

  validates :uid, presence: true, format: { with: /\A[0-9A-F]{8}\z/ }
  validates :valid_from, :valid_to, :day_start_s, :day_end_s, :remaining_uses, :version, presence: true
  validates :remaining_uses, numericality: { greater_than_or_equal_to: 0 }
  validate :validity_ranges
  validate :token_window_fields

  def self.ransackable_attributes(auth_object = nil)
    [
      "id",
      "acs_device_id",
      "client_id",
      "booking_id",
      "uid",
      "valid_from",
      "valid_to",
      "day_start_s",
      "day_end_s",
      "remaining_uses",
      "version",
      "created_at",
      "updated_at"
    ]
  end

  def self.ransackable_associations(auth_object = nil)
    ["acs_device", "client", "booking"]
  end

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

  def token_window_fields
    if day_start_s.present? && day_start_s != 0
      errors.add(:day_start_s, "must be 0")
    end

    if day_end_s.present? && day_end_s != 86_399
      errors.add(:day_end_s, "must be 86399")
    end

    if valid_from.present? && valid_from < MIN_UNIX_TS
      errors.add(:valid_from, "must be unix timestamp")
    end

    if valid_to.present? && valid_to < MIN_UNIX_TS
      errors.add(:valid_to, "must be unix timestamp")
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
