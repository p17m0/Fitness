class User < ApplicationRecord
  include Devise::JWT::RevocationStrategies::Allowlist

  devise :database_authenticatable,
         :registerable, :recoverable,
         :validatable,
         :jwt_authenticatable, jwt_revocation_strategy: self

  belongs_to :roleable, polymorphic: true

  def generate_token
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

    JWT.encode(payload, ENV['JWT_SECRET_KEY'], 'HS256', { exp: exp.to_i })
  end
end
