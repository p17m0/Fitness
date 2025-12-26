class Product < ApplicationRecord
  belongs_to :purchasable, polymorphic: true

  validates :name, presence: true
  validates :price_cents, numericality: { greater_than_or_equal_to: 0 }

  before_validation :mirror_from_purchasable, on: :create

  def self.ransackable_attributes(auth_object = nil)
    ["id", "name", "description", "price_cents", "currency", "purchasable_type", "purchasable_id", "created_at", "updated_at"]
  end

  def self.ransackable_associations(auth_object = nil)
    ["purchasable"]
  end

  private

  def mirror_from_purchasable
    return unless purchasable
    self.name ||= purchasable.try(:name)
    self.description ||= purchasable.try(:description)
    self.price_cents ||= purchasable.try(:price_cents)
    self.currency ||= purchasable.try(:currency)
  end
end
