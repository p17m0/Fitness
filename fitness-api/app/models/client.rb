class Client < ApplicationRecord
  has_many :bookings, dependent: :destroy
  has_many :gym_slots, through: :bookings
  has_many :coach_slots, through: :bookings
  has_many :client_subscriptions, dependent: :destroy
  has_many :subscription_plans, through: :client_subscriptions
end
