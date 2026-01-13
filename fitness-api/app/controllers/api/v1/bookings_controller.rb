class Api::V1::BookingsController < Api::BaseController
  def index
    return render_error("Только клиент", :forbidden) unless current_client
    render json: current_client.bookings.includes(:gym_slot, :coach_slot).map { |booking| serialize_booking(booking) }
  end

  def create
    return render_error("Только клиент", :forbidden) unless current_client

    ActiveRecord::Base.transaction do
      gym_slot = GymSlot.available_to_book.lock.find_by(id: booking_params[:gym_slot_id])
      same_gym_slot_exists = current_client.booked_gym_slots.where(starts_at: gym_slot.starts_at).exists?
      raise ActiveRecord::RecordNotFound, "Cлот с таким же временем заблокирован" if same_gym_slot_exists
      raise ActiveRecord::RecordNotFound, "Слот недоступен" unless gym_slot

      coach_slot_id = booking_params[:coach_slot_id]
      coach_slot = coach_slot_id.present? ? CoachSlot.available_to_book.lock.find_by(id: coach_slot_id) : nil
      raise ActiveRecord::RecordNotFound, "Слот тренера недоступен" if coach_slot_id.present? && coach_slot.nil?

      ensure_slot_horizon!(gym_slot)
      ensure_coach_slot_matches!(coach_slot, gym_slot)

      subscription = current_client.client_subscriptions.active_for_booking.order(:expires_at).first
      raise "Нет активного абонемента" unless subscription

      booking = current_client.bookings.create!(gym_slot: gym_slot, coach_slot: coach_slot)
      gym_slot.book!
      coach_slot&.book!
      subscription.consume_visit!
      render json: booking, status: :created and return
    end
  rescue ActiveRecord::RecordInvalid => e
    render_error(e.record.errors.full_messages)
  rescue ActiveRecord::RecordNotFound => e
    render_error(e.message, :not_found)
  rescue StandardError => e
    render_error(e.message)
  end

  def create_coach_booking
    return render_error("Только клиент", :forbidden) unless current_client
    coach_slot = CoachSlot.find(booking_params[:coach_slot_id])

    booking = current_client.bookings.find_by(id: params[:booking_id]).update(coach_slot: coach_slot)
    coach_slot&.book!
    render json: booking, status: :created
  end

  def destroy
    return render_error("Только клиент", :forbidden) unless current_client
    booking = current_client.bookings.lock.find(params[:id])
    # TODO отменять только за СУТКИ можно

    is_available_to_cancel = booking.gym_slot.starts_at - Time.current < 24.hours
    return render_error("Можно отменить только за 24 часа") if is_available_to_cancel

    ActiveRecord::Base.transaction do
      booking.gym_slot.lock! if booking.gym_slot
      booking.coach_slot&.lock!

      booking.update!(status: :cancelled)
      booking.gym_slot.release! if booking.gym_slot
      booking.coach_slot&.release!
    end
    head :no_content
  rescue ActiveRecord::RecordInvalid => e
    render_error(e.record.errors.full_messages)
  end

  private

  def serialize_booking(booking)
    {
      id: booking.id,
      coach_name: booking&.coach_slot&.coach&.user&.first_name,
      starts_at: booking&.gym_slot&.starts_at
    }
  end

  def booking_params
    params.require(:booking).permit(:gym_slot_id, :coach_slot_id)
  end

  def ensure_slot_horizon!(gym_slot)
    now = Time.current
    horizon_end = now + BOOKING_HORIZON_DAYS.days
    raise "Слот уже в прошлом" if gym_slot.starts_at < now
    raise "Слот слишком далеко в будущем" if gym_slot.starts_at.to_date > horizon_end.to_date
  end

  def ensure_coach_slot_matches!(coach_slot, gym_slot)
    return if coach_slot.blank?
    raise "Слот тренера недоступен" unless coach_slot.available_for_booking?
    return if coach_slot.starts_at == gym_slot.starts_at && coach_slot.ends_at == gym_slot.ends_at

    raise "Слот тренера не совпадает по времени со слотом зала"
  end
end
