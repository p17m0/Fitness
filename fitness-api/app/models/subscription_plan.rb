class SubscriptionPlan < ApplicationRecord
  has_one :product, as: :purchasable, dependent: :destroy
  has_many :client_subscriptions, dependent: :destroy

  validates :name, presence: true
  validates :visits_count, :duration_days, numericality: { greater_than: 0 }
  validates :price_cents, numericality: { greater_than_or_equal_to: 0 }

  def self.ransackable_attributes(auth_object = nil)
    ["id", "name", "description", "visits_count", "duration_days", "price_cents", "currency", "created_at", "updated_at"]
  end

  def self.ransackable_associations(auth_object = nil)
    ["product", "client_subscriptions"]
  end
end
