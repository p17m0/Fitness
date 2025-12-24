class ClientSubscription < ApplicationRecord
  belongs_to :client
  belongs_to :subscription_plan


  enum :status, { active: "active", expired: "expired" }, suffix: true

  validates :remaining_visits, numericality: { greater_than_or_equal_to: 0 }

  before_validation :apply_defaults, on: :create

  def consume_visit!
    raise "Нет доступных посещений" if remaining_visits <= 0
    self.remaining_visits -= 1
    self.status = :expired if remaining_visits.zero?
    save!
  end

  private

  def apply_defaults
    self.remaining_visits = subscription_plan&.visits_count
    self.expires_at ||= Time.current + subscription_plan.duration_days.days if subscription_plan
    self.status ||= "active"
  end
end
