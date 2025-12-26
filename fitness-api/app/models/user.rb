class User < ApplicationRecord
  include Devise::JWT::RevocationStrategies::Allowlist

  has_many :allowlisted_jwts, dependent: :destroy

  devise :database_authenticatable,
         :registerable, :recoverable,
         :validatable,
         :jwt_authenticatable, jwt_revocation_strategy: self

  belongs_to :roleable, polymorphic: true, optional: true
  before_create :set_client_role

  def generate_token
    jwt_secret = Devise.jwt_config.secret
    raise 'JWT secret is not configured' if jwt_secret.blank?

    exp = 14.days.from_now
    jti = SecureRandom.uuid
    payload = {
      "sub" => self.id,
      "scp" => "user",
      "aud" => nil,
      "iat" => Time.now.to_i,
      "exp" => exp.to_i,
      "jti" => jti
    }

    self.allowlisted_jwts.create!(
      jti: jti,
      aud: nil,
      exp: exp
    )

    JWT.encode(payload, jwt_secret, 'HS256', { exp: exp.to_i })
  end

  def set_client_role
    if self.roleable.nil?
      self.roleable_type = "Client"
      self.roleable_id = Client.create.id
    end
  end

  def self.ransackable_attributes(auth_object = nil)
    ["id", "email", "first_name", "last_name", "phone_number", "roleable_type", "roleable_id", "created_at", "updated_at"]
  end

  def self.ransackable_associations(auth_object = nil)
    ["roleable", "allowlisted_jwts"]
  end
end
