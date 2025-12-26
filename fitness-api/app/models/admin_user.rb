class AdminUser < ApplicationRecord
  # Include default devise modules. Others available are:
  # :confirmable, :lockable, :timeoutable, :trackable and :omniauthable
  devise :database_authenticatable,
         :recoverable, :rememberable, :validatable

  def self.ransackable_attributes(auth_object = nil)
    ["id", "email", "created_at", "updated_at", "current_sign_in_at", "last_sign_in_at", "sign_in_count"]
  end

  def self.ransackable_associations(auth_object = nil)
    []
  end
end
