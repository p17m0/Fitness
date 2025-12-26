class Program < ApplicationRecord
  has_one :product, as: :purchasable, dependent: :destroy

  # belongs_to :coach
  validates :name, presence: true
  validates :duration_minutes, numericality: { greater_than: 0 }
  validates :price_cents, numericality: { greater_than_or_equal_to: 0 }

  def self.ransackable_attributes(auth_object = nil)
    ["id", "name", "description", "duration_minutes", "price_cents", "currency", "created_at", "updated_at"]
  end

  def self.ransackable_associations(auth_object = nil)
    ["product"]
  end
end
