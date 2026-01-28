module Acs
  class TokenIssuer
    WINDOW_BEFORE_START = 5.minutes

    def self.issue_for_booking!(booking)
      new(booking).issue!
    end

    def initialize(booking)
      @booking = booking
    end

    def issue!
      return if gym.nil?

      gym.acs_devices.find_each do |device|
        Rails.logger.error "SUKA"
        create_token_for!(device)
      end
    end

    private

    attr_reader :booking

    def gym
      booking.gym_slot&.gym
    end

    def create_token_for!(device)
      retries = 0
      begin
        AcsToken.create!(
          acs_device: device,
          client: booking.client,
          booking: booking,
          uid: generate_uid,
          valid_from: valid_from,
          valid_to: valid_to,
          day_start_s: day_start_s,
          day_end_s: day_end_s,
          remaining_uses: 1
        )
      rescue ActiveRecord::RecordNotUnique
        retries += 1
        retry if retries < 20
        raise
      rescue => e
        Rails.logger.error("LOL")
        Rails.logger.error(e.message)
      end
    end

    def generate_uid
      SecureRandom.hex(4).upcase
    end

    def valid_from
      token_window_start.to_i
    end

    def valid_to
      token_window_end.to_i
    end

    def day_start_s
      0
    end

    def day_end_s
      86_399
    end

    def token_window_start
      booking.gym_slot.starts_at - WINDOW_BEFORE_START
    end

    def token_window_end
      booking.gym_slot.ends_at
    end
  end
end
