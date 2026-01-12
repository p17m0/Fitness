class Api::V1::GymsController < Api::BaseController
  skip_before_action :authenticate_user!

  def index
    render json: Gym.all
  end

  def show
    render json: gym
  end

  private

  def gym
    @gym ||= Gym.find(params[:id])
  end

  def gym_params
    params.require(:gym).permit(:name, :address, :description, :capacity)
  end
end
