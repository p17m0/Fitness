class Api::V1::CoachesController < Api::BaseController
  def index
    render json: User.where(roleable_type: "Coach")
  end

  # def show
  #   coach = User.find(params[:user_id]).roleable
  #   render json: coach.
  # end
end
