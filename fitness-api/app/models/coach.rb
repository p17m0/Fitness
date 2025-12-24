class Coach < ApplicationRecord
  has_one :user, as: :roleable, dependent: :destroy
  has_many :coach_slots, dependent: :destroy
end
