class GymSlot < ApplicationRecord
  belongs_to :gym
  has_many :bookings, dependent: :destroy

  enum :status, { available: "available", booked: "booked", cancelled: "cancelled" }, suffix: true

  validates :starts_at, :ends_at, presence: true
  validate :ends_after_starts
  validate :within_gym_hours
  validate :within_booking_horizon

  scope :upcoming, -> { where("starts_at >= ?", Time.current) }
  scope :expired, -> { where("starts_at < ?", Time.current) }

  scope :available, -> { where(status: :available) }
  scope :booked, -> { where(status: :booked) }
  scope :cancelled, -> { where(status: :cancelled) }

  scope :available_to_book, lambda {
    now = Time.current
    horizon_end = now + BOOKING_HORIZON_DAYS.days
    available_status.where(starts_at: now..horizon_end)
  }

  def book!
    with_lock do
      raise "Слот недоступен" unless available_for_booking?(skip_booking_check: true)
      update!(status: :booked)
    end
  end

  def release!
    with_lock do
      update!(status: :available) unless bookings.booked_only.exists?
    end
  end

  def available_for_booking?(at: Time.current, skip_booking_check: false)
    return false unless available_status?
    return false unless within_gym_day_and_hours?
    return false if starts_at < at
    return false if starts_at.to_date > (at + BOOKING_HORIZON_DAYS.days).to_date

    skip_booking_check || !bookings.booked_only.exists?
  end

  private

  def ends_after_starts
    return if starts_at.blank? || ends_at.blank?
    errors.add(:ends_at, "должен быть позже начала") if ends_at <= starts_at
  end

  def within_gym_hours
    return if starts_at.blank? || ends_at.blank? || gym.blank?
    return errors.add(:base, "Слот должен быть в пределах одного дня") unless within_same_day?
    return errors.add(:base, "Укажите время работы зала") unless working_hours_present?

    open_time, close_time = working_hours_boundaries
    errors.add(:starts_at, "раньше открытия зала") if starts_at < open_time
    errors.add(:ends_at, "позже закрытия зала") if ends_at > close_time
  end

  def within_booking_horizon
    return if starts_at.blank?
    now = Time.current
    horizon_end = now + BOOKING_HORIZON_DAYS.days

    errors.add(:starts_at, "не может быть в прошлом") if starts_at < now
    errors.add(:starts_at, "слишком далеко в будущем") if starts_at.to_date > horizon_end.to_date
    errors.add(:ends_at, "слишком далеко в будущем") if ends_at && ends_at.to_date > horizon_end.to_date
  end

  def within_gym_day_and_hours?
    return false if starts_at.blank? || ends_at.blank? || gym.blank?
    return false unless within_same_day?
    return false unless working_hours_present?

    open_time, close_time = working_hours_boundaries
    starts_at >= open_time && ends_at <= close_time
  end

  def working_hours_present?
    gym.opens_at.present? && gym.closes_at.present?
  end

  def working_hours_boundaries
    open_time = starts_at.change(hour: gym.opens_at.hour, min: gym.opens_at.min, sec: 0)
    close_time = starts_at.change(hour: gym.closes_at.hour, min: gym.closes_at.min, sec: 0)
    [open_time, close_time]
  end

  def within_same_day?
    starts_at.to_date == ends_at.to_date
  end

  def self.ransackable_attributes(auth_object = nil)
    ["id", "gym_id", "starts_at", "ends_at", "status", "created_at", "updated_at"]
  end

  def self.ransackable_associations(auth_object = nil)
    ["gym", "bookings"]
  end
end
