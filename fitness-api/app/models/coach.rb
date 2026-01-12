class Coach < ApplicationRecord
  has_one :user, as: :roleable, dependent: :destroy
  has_many :coach_slots, dependent: :destroy
  has_many :programs, dependent: :destroy

  def self.ransackable_attributes(auth_object = nil)
    ["id", "created_at", "updated_at"]
  end

  def self.ransackable_associations(auth_object = nil)
    ["user", "coach_slots"]
  end
end
