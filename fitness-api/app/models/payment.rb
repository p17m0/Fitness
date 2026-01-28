class Payment < ApplicationRecord
  belongs_to :client
  belongs_to :subscription_plan
  belongs_to :client_subscription, optional: true

  enum :status, {
    pending: "pending",
    requires_3ds: "requires_3ds",
    paid: "paid",
    failed: "failed"
  }, suffix: true

  validates :amount, numericality: { greater_than: 0 }
  validates :currency, :provider, presence: true

  def self.ransackable_attributes(auth_object = nil)
    [
      "id",
      "client_id",
      "subscription_plan_id",
      "client_subscription_id",
      "amount",
      "currency",
      "status",
      "provider",
      "provider_transaction_id",
      "provider_reason_code",
      "provider_message",
      "created_at",
      "updated_at"
    ]
  end

  def self.ransackable_associations(auth_object = nil)
    ["client", "subscription_plan", "client_subscription"]
  end
end
