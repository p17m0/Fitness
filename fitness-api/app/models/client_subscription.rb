class ClientSubscription < ApplicationRecord
  belongs_to :client
  belongs_to :subscription_plan


  enum :status, { active: "active", expired: "expired" }, suffix: true

  scope :active_for_booking, lambda {
    where(status: :active)
      .where("remaining_visits > 0")
      .where("expires_at IS NULL OR expires_at >= ?", Time.current)
  }
  scope :active, -> { where(status: :active) }
  scope :expired, -> { where(status: :expired) }

  validates :remaining_visits, numericality: { greater_than_or_equal_to: 0 }

  before_validation :apply_defaults, on: :create

  def self.ransackable_attributes(auth_object = nil)
    ["id", "client_id", "subscription_plan_id", "remaining_visits", "expires_at", "status", "created_at", "updated_at"]
  end

  def self.ransackable_associations(auth_object = nil)
    ["client", "subscription_plan"]
  end

  def consume_visit!
    raise "Нет доступных посещений" if remaining_visits <= 0
    self.remaining_visits -= 1
    self.status = :expired if remaining_visits.zero?
    save!
  end

  def active_for_booking?
    active_status? && remaining_visits.positive? && (expires_at.nil? || expires_at >= Time.current)
  end

  private

  def apply_defaults
    self.remaining_visits = subscription_plan&.visits_count
    self.expires_at ||= Time.current + subscription_plan.duration_days.days if subscription_plan
    self.status ||= "active"
  end
end
