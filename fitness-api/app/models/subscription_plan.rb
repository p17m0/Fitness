class SubscriptionPlan < ApplicationRecord
  has_one :product, as: :purchasable, dependent: :destroy

  validates :name, presence: true
  validates :visits_count, :duration_days, numericality: { greater_than: 0 }
  validates :price_cents, numericality: { greater_than_or_equal_to: 0 }
end
