class Api::V1::CoachSlotsController < Api::BaseController
  def index
    scope = CoachSlot.available_to_book.includes(coach: :user)
    scope = scope.where(coach_id: params[:coach_id]) if params[:coach_id]

    if params[:starts_at].present?
      begin
        starts_at = Time.zone.parse(params[:starts_at])
        scope = scope.where(starts_at: starts_at)
      rescue ArgumentError
        return render_error("Некорректный формат starts_at", :bad_request)
      end
    end

    render json: scope.map { |slot| serialize_coach_slot(slot) }
  end

  def show
    render json: coach_slot
  end

  private

  def coach_slot
    @coach_slot ||= CoachSlot.find(params[:id])
  end

  def coach_slot_params
    params.require(:coach_slot).permit(:coach_id, :starts_at, :ends_at, :status)
  end

  def serialize_coach_slot(slot)
    user = slot.coach&.user
    {
      id: slot.id,
      coach_id: slot.coach_id,
      starts_at: slot.starts_at,
      ends_at: slot.ends_at,
      status: slot.status,
      coach: user ? {
        id: user.id,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
      } : nil
    }
  end
end
