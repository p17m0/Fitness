class Api::V1::BookingsController < Api::BaseController
  def index
    return render_error("Только клиент", :forbidden) unless current_client
    render json: current_client.bookings.includes(:gym_slot, :coach_slot)
  end

  def create
    return render_error("Только клиент", :forbidden) unless current_client

    ActiveRecord::Base.transaction do
      gym_slot = GymSlot.find(booking_params[:gym_slot_id])
      coach_slot = booking_params[:coach_slot_id].presence && CoachSlot.find(booking_params[:coach_slot_id])

      raise "Слот зала недоступен" unless gym_slot.available_status?
      raise "Слот тренера недоступен" if coach_slot && !coach_slot.available_status?

      subscription = current_client.client_subscriptions.active_status.where("remaining_visits > 0").order(:expires_at).first
      raise "Нет доступных посещений" unless subscription

      gym_slot.book!
      coach_slot&.book!
      subscription.consume_visit!

      booking = current_client.bookings.create!(gym_slot: gym_slot, coach_slot: coach_slot)
      render json: booking, status: :created and return
    end
  rescue ActiveRecord::RecordInvalid => e
    render_error(e.record.errors.full_messages)
  rescue StandardError => e
    render_error(e.message)
  end

  def destroy
    return render_error("Только клиент", :forbidden) unless current_client
    booking = current_client.bookings.find(params[:id])
    ActiveRecord::Base.transaction do
      booking.update!(status: :cancelled)
      booking.gym_slot.release!
      booking.coach_slot&.release!
    end
    head :no_content
  rescue ActiveRecord::RecordInvalid => e
    render_error(e.record.errors.full_messages)
  end

  private

  def booking_params
    params.require(:booking).permit(:gym_slot_id, :coach_slot_id)
  end
end


