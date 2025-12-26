class GymSlots::Generator
  DEFAULT_DURATION = 60.minutes

  def initialize(gym:, from: Date.current, to: Date.current + GymSlot::BOOKING_HORIZON_DAYS.days, slot_duration: DEFAULT_DURATION)
    @gym = gym
    @from = from
    @to = to
    @slot_duration = slot_duration
  end

  def call
    raise ArgumentError, "Отсутствуют часы работы зала" if gym.opens_at.blank? || gym.closes_at.blank?
    raise ArgumentError, "Дата конца раньше начала" if to < from

    slots = []
    date = from
    while date <= to
      slots.concat(generate_for_day(date))
      date += 1.day
    end
    slots
  end

  private

  attr_reader :gym, :from, :to, :slot_duration

  def generate_for_day(date)
    day_open = date.to_time.in_time_zone.change(hour: gym.opens_at.hour, min: gym.opens_at.min, sec: 0)
    day_close = date.to_time.in_time_zone.change(hour: gym.closes_at.hour, min: gym.closes_at.min, sec: 0)
    now = Time.current

    slots = []
    cursor = day_open
    while cursor + slot_duration <= day_close
      # Пропускаем слоты в прошлом
      if cursor >= now
        slots << GymSlot.find_or_create_by!(gym: gym, starts_at: cursor, ends_at: cursor + slot_duration) do |slot|
          slot.status = :available
        end
      end
      cursor += slot_duration
    end
    slots
  end
end
