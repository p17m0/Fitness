class Program < ApplicationRecord
  belongs_to :coach
  validates :name, presence: true
  validates :duration_minutes, numericality: { greater_than: 0 }

  def self.ransackable_attributes(auth_object = nil)
    ["id", "name", "description", "duration_minutes", "created_at", "updated_at"]
  end

  def self.ransackable_associations(auth_object = nil)
    ["coach"]
  end
end
