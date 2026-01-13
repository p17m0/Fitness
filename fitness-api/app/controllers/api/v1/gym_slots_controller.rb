class Api::V1::GymSlotsController < Api::BaseController
  def index
    scope = GymSlot.available_to_book.includes(:gym)
    scope = scope.where(gym_id: params[:gym_id]) if params[:gym_id]
    scope = scope.where.not(starts_at: current_client.booked_gym_slots.pluck(:starts_at))
    render json: scope
  end

  def show
    render json: gym_slot
  end

  private

  def gym_slot
    @gym_slot ||= GymSlot.find(params[:id])
  end

  def gym_slot_params
    params.require(:gym_slot).permit(:gym_id, :starts_at, :ends_at, :status)
  end

  def require_active_subscription!
    return render_error("Только клиент", :forbidden) unless current_client
    return if current_client.client_subscriptions.active_for_booking.exists?

    render_error("Нет активного абонемента", :forbidden)
  end
end
