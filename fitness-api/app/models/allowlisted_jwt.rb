class AllowlistedJwt < ApplicationRecord
  belongs_to :user

  def self.ransackable_attributes(auth_object = nil)
    ["id", "user_id", "jti", "aud", "exp", "created_at", "updated_at"]
  end

  def self.ransackable_associations(auth_object = nil)
    ["user"]
  end
end
