class Api::V1::GymSlotsController < Api::BaseController
  def index
    scope = GymSlot.includes(:gym)
    scope = scope.where(gym_id: params[:gym_id]) if params[:gym_id]
    render json: scope
  end

  def show
    render json: gym_slot
  end

  def create
    slot = GymSlot.new(gym_slot_params)
    return render json: slot, status: :created if slot.save
    render_error(slot.errors.full_messages)
  end

  def update
    return render json: gym_slot if gym_slot.update(gym_slot_params)
    render_error(gym_slot.errors.full_messages)
  end

  def destroy
    gym_slot.destroy!
    head :no_content
  end

  private

  def gym_slot
    @gym_slot ||= GymSlot.find(params[:id])
  end

  def gym_slot_params
    params.require(:gym_slot).permit(:gym_id, :starts_at, :ends_at, :status)
  end
end
