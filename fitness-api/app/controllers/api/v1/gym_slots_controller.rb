class Api::V1::GymSlotsController < Api::BaseController
  before_action :require_active_subscription!, only: :create

  def index
    scope = GymSlot.available_to_book.includes(:gym)
    scope = scope.where(gym_id: params[:gym_id]) if params[:gym_id]
    render json: scope
  end

  def show
    render json: gym_slot
  end

  # def create
  #   slot = GymSlot.find_or_initialize_by(gym_id: gym_slot_params[:gym_id], starts_at: gym_slot_params[:starts_at], ends_at: gym_slot_params[:ends_at])
  #   slot.status ||= :available

  #   return render json: slot if slot.persisted? && slot.valid?

  #   return render json: slot, status: :created if slot.save
  #   render_error(slot.errors.full_messages)
  # end

  # def update
  #   return render json: gym_slot if gym_slot.update(gym_slot_params)
  #   render_error(gym_slot.errors.full_messages)
  # end

  # def destroy
  #   gym_slot.destroy!
  #   head :no_content
  # end

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
