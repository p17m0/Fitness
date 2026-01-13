class CoachSlot < ApplicationRecord
  belongs_to :coach
  has_many :bookings

  enum :status, { available: "available", booked: "booked", cancelled: "cancelled" }, suffix: true

  validates :starts_at, :ends_at, presence: true
  validate :ends_after_starts

  scope :available_to_book, lambda {
    now = Time.current
    horizon_end = now + BOOKING_HORIZON_DAYS.days
    available_status.where(starts_at: now..horizon_end)
  }

  scope :available, -> { where(status: :available) }
  scope :booked, -> { where(status: :booked) }
  scope :cancelled, -> { where(status: :cancelled) }

  def book!
    with_lock do
      raise "Слот тренера недоступен" unless available_for_booking?(skip_booking_check: true)
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
    return false if starts_at < at
    return false if starts_at.to_date > (at + BOOKING_HORIZON_DAYS.days).to_date
    return false if !skip_booking_check && bookings.booked_only.exists?
    true
  end

  private

  def ends_after_starts
    return if starts_at.blank? || ends_at.blank?
    errors.add(:ends_at, "должен быть позже начала") if ends_at <= starts_at
  end

  def self.ransackable_attributes(auth_object = nil)
    ["id", "coach_id", "starts_at", "ends_at", "status", "created_at", "updated_at"]
  end

  def self.ransackable_associations(auth_object = nil)
    ["coach", "bookings"]
  end
end
