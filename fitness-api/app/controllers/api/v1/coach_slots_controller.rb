class Api::V1::CoachSlotsController < Api::BaseController
  def index
    scope = CoachSlot.available_to_book.includes(coach: :user, gym_slot: :gym)
    scope = scope.where(coach_id: params[:coach_id]) if params[:coach_id]
    scope = scope.where(gym_slot_id: params[:gym_slot_id]) if params[:gym_slot_id]
    if params[:gym_id]
      scope = scope.joins(:gym_slot).where(gym_slots: { gym_id: params[:gym_id] })
    end
    render json: scope.map { |slot| serialize_coach_slot(slot) }
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

  def serialize_coach_slot(slot)
    user = slot.coach&.user
    {
      id: slot.id,
      coach_id: slot.coach_id,
      gym_slot_id: slot.gym_slot_id,
      starts_at: slot.starts_at,
      ends_at: slot.ends_at,
      status: slot.status,
      coach: user ? {
        id: user.id,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        specialization: nil # TODO: добавить поле в Coach если нужно
      } : nil
    }
  end
end
