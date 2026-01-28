require "securerandom"

module Acs
  class MessageId
    def self.generate(prefix = nil)
      base = SecureRandom.alphanumeric(12)
      prefix.present? ? "#{prefix}-#{base}" : base
    end
  end
end
