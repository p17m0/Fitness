class Booking < ApplicationRecord
  belongs_to :client
  belongs_to :gym_slot
  belongs_to :coach_slot, optional: true

  has_one :acs_token, dependent: :destroy

  enum :status, { booked: "booked", cancelled: "cancelled" }, suffix: true

  validates :client, :gym_slot, presence: true
  validates :status, inclusion: { in: statuses.keys }
  validates :gym_slot_id, uniqueness: {
    scope: :client_id,
    conditions: -> { where.not(status: :cancelled) },
    message: "уже забронирован этим клиентом"
  }
  validate :gym_slot_available, on: :create
  validate :coach_slot_available, on: :create
  validate :coach_slot_matches_gym_slot
  validate :gym_slot_within_horizon
  validate :client_has_active_subscription, on: :create

  scope :booked_only, -> { where(status: :booked) }
  scope :cancelled_only, -> { where(status: :cancelled) }
  scope :booked, -> { where(status: :booked) }
  scope :cancelled, -> { where(status: :cancelled) }

  def self.ransackable_attributes(auth_object = nil)
    ["id", "client_id", "gym_slot_id", "coach_slot_id", "status", "created_at", "updated_at"]
  end

  def self.ransackable_associations(auth_object = nil)
    ["client", "gym_slot", "coach_slot"]
  end

  private

  def gym_slot_available
    return errors.add(:gym_slot, "не найден") unless gym_slot
    return if gym_slot.available_for_booking?

    errors.add(:gym_slot, "Зал недоступен для бронирования")
  end

  def coach_slot_available
    return if coach_slot.blank?
    return if coach_slot.available_for_booking?

    errors.add(:coach_slot, "Тренер недоступен для бронирования")
  end

  def coach_slot_matches_gym_slot
    return if coach_slot.blank?
    return if coach_slot.starts_at == gym_slot.starts_at && coach_slot.ends_at == gym_slot.ends_at
    errors.add(:coach_slot, "должен совпадать по времени со слотом зала")
  end

  def gym_slot_within_horizon
    return if gym_slot.blank? || gym_slot.starts_at.blank?
    now = Time.current
    horizon_end = now + BOOKING_HORIZON_DAYS.days
    errors.add(:gym_slot, "не может быть в прошлом") if gym_slot.starts_at < now
    errors.add(:gym_slot, "слишком далеко в будущем") if gym_slot.starts_at.to_date > horizon_end.to_date
  end

  def client_has_active_subscription
    return errors.add(:client, "не найден") unless client
    return if client.client_subscriptions.active_for_booking.exists?

    errors.add(:base, "У клиента нет активного абонемента")
  end
end
