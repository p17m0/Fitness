class Gym < ApplicationRecord
  has_many :gym_slots, dependent: :destroy

  validates :name, :address, presence: true
  validates :capacity, numericality: { greater_than: 0 }
  validates :opens_at, :closes_at, presence: true
  validate :opens_before_closes

  private

  def opens_before_closes
    return if opens_at.blank? || closes_at.blank?
    errors.add(:closes_at, "должно быть позже открытия") unless opens_at < closes_at
  end
end
