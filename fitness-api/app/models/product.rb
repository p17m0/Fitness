class Product < ApplicationRecord
  belongs_to :purchasable, polymorphic: true

  validates :name, presence: true
  validates :price_cents, numericality: { greater_than_or_equal_to: 0 }

  before_validation :mirror_from_purchasable, on: :create

  private

  def mirror_from_purchasable
    return unless purchasable
    self.name ||= purchasable.try(:name)
    self.description ||= purchasable.try(:description)
    self.price_cents ||= purchasable.try(:price_cents)
    self.currency ||= purchasable.try(:currency)
  end
end
