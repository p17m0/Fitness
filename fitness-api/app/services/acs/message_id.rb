require "securerandom"

module Acs
  class MessageId
    def self.generate(prefix = nil)
      base = SecureRandom.uuid
      prefix.present? ? "#{prefix}-#{base}" : base
    end
  end
end
