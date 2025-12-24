class Api::V1::CoachSlotsController < Api::BaseController
  def index
    scope = CoachSlot.includes(:coach)
    scope = scope.where(coach_id: params[:coach_id]) if params[:coach_id]
    render json: scope
  end

  def show
    render json: coach_slot
  end

  def create
    record = CoachSlot.new(coach_slot_params)
    return render json: record, status: :created if record.save
    render_error(record.errors.full_messages)
  end

  def update
    return render json: coach_slot if coach_slot.update(coach_slot_params)
    render_error(coach_slot.errors.full_messages)
  end

  def destroy
    coach_slot.destroy!
    head :no_content
  end

  private

  def coach_slot
    @coach_slot ||= CoachSlot.find(params[:id])
  end

  def coach_slot_params
    params.require(:coach_slot).permit(:coach_id, :gym_slot_id, :starts_at, :ends_at, :status)
  end
end
