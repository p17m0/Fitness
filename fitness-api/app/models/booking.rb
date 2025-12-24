class Booking < ApplicationRecord
  belongs_to :client
  belongs_to :gym_slot
  belongs_to :coach_slot, optional: true

  enum :status, { booked: "booked", cancelled: "cancelled" }, suffix: true

  validates :client, :gym_slot, presence: true
end
