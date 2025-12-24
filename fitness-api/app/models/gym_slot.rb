class GymSlot < ApplicationRecord
  belongs_to :gym
  has_many :bookings, dependent: :destroy
  has_many :coach_slots

  enum :status, { available: "available", booked: "booked", cancelled: "cancelled" }, suffix: true

  validates :starts_at, :ends_at, presence: true
  validate :ends_after_starts

  def book!
    raise "Слот недоступен" unless available_status?
    update!(status: :booked)
  end

  def release!
    update!(status: :available)
  end

  private

  def ends_after_starts
    return if starts_at.blank? || ends_at.blank?
    errors.add(:ends_at, "должен быть позже начала") if ends_at <= starts_at
  end
end
