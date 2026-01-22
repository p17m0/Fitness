class Gym < ApplicationRecord
  has_many :gym_slots, dependent: :destroy
  has_many :acs_devices, dependent: :destroy

  validates :name, :address, presence: true
  validates :capacity, numericality: { greater_than: 0 }
  validates :opens_at, :closes_at, presence: true
  validate :opens_before_closes

  def self.ransackable_attributes(auth_object = nil)
    ["id", "name", "address", "description", "capacity", "opens_at", "closes_at", "created_at", "updated_at"]
  end

  def self.ransackable_associations(auth_object = nil)
    ["gym_slots", "acs_devices"]
  end

  private

  def opens_before_closes
    return if opens_at.blank? || closes_at.blank?
    errors.add(:closes_at, "должно быть позже открытия") unless opens_at < closes_at
  end
end
