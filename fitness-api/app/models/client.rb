class Client < ApplicationRecord
  has_one :user, as: :roleable, dependent: :destroy
  has_many :bookings, dependent: :destroy
  has_many :gym_slots, through: :bookings
  has_many :coach_slots, through: :bookings
  has_many :client_subscriptions, dependent: :destroy
  has_many :subscription_plans, through: :client_subscriptions
  has_many :acs_tokens, dependent: :nullify

  def self.ransackable_attributes(auth_object = nil)
    ["id", "created_at", "updated_at"]
  end

  def self.ransackable_associations(auth_object = nil)
    ["user", "bookings", "gym_slots", "coach_slots", "client_subscriptions", "subscription_plans", "acs_tokens"]
  end

  def booked_gym_slots
    gym_slot_ids = bookings.pluck(:gym_slot_id)
    GymSlot.where(id: gym_slot_ids)
  end
end
