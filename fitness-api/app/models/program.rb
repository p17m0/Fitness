class Program < ApplicationRecord
  has_one :product, as: :purchasable, dependent: :destroy

  # belongs_to :coach
  validates :name, presence: true
  validates :duration_minutes, numericality: { greater_than: 0 }
  validates :price_cents, numericality: { greater_than_or_equal_to: 0 }
end
