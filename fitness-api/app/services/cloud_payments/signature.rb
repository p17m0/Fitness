require "base64"
require "openssl"

module CloudPayments
  class Signature
    def self.valid?(body, provided_signature, api_secret)
      return false if provided_signature.blank? || api_secret.blank?

      digest = OpenSSL::HMAC.digest("sha256", api_secret, body.to_s)
      expected = Base64.strict_encode64(digest)
      ActiveSupport::SecurityUtils.secure_compare(expected, provided_signature)
    end
  end
end
