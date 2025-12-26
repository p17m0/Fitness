module CoachSlots
  class Generator
    def initialize(coach:, gym:, from: Date.current, to: Date.current + GymSlot::BOOKING_HORIZON_DAYS.days)
      @coach = coach
      @gym = gym
      @from = from
      @to = to
    end

    def call
      raise ArgumentError, "Тренер не указан" if coach.blank?
      raise ArgumentError, "Зал не указан" if gym.blank?
      raise ArgumentError, "Дата конца раньше начала" if to < from

      slots = []
      gym_slots_scope.find_each do |gym_slot|
        next unless gym_slot.available_for_booking?

        # Уникальный индекс по (coach_id, starts_at, ends_at)
        slot = CoachSlot.find_or_initialize_by(
          coach: coach,
          starts_at: gym_slot.starts_at,
          ends_at: gym_slot.ends_at
        )
        # Обновляем gym_slot для новых и существующих записей
        slot.gym_slot = gym_slot
        slot.status = :available if slot.new_record?
        slot.save!
        slots << slot
      end
      slots
    end

    private

    attr_reader :coach, :gym, :from, :to

    def gym_slots_scope
      range_start = from.to_time.beginning_of_day
      range_end = to.to_time.end_of_day

      gym.gym_slots
        .available_status
        .where(starts_at: range_start..range_end)
    end
  end
end
