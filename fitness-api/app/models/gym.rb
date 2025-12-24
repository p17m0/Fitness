class Gym < ApplicationRecord
  has_many :gym_slots, dependent: :destroy

  validates :name, :address, presence: true
  validates :capacity, numericality: { greater_than: 0 }
end
