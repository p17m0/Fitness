class Api::V1::CoachesController < Api::BaseController
  def index
    coaches = User.where(roleable_type: "Coach").includes(:roleable)
    render json: coaches.map { |user| serialize_coach(user) }
  end

  def show
    user = User.find(params[:id])
    return render_error("Не тренер", :not_found) unless user.roleable_type == "Coach"

    render json: serialize_coach(user)
  end

  private

  def serialize_coach(user)
    {
      id: user.id,
      coach_id: user.roleable_id,
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      phone_number: user.phone_number,
    }
  end
end
