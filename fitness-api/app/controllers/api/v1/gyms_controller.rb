class Api::V1::GymsController < Api::BaseController
  def index
    render json: Gym.all
  end

  def show
    render json: gym
  end

  # def create
  #   gym = Gym.new(gym_params)
  #   return render json: gym, status: :created if gym.save
  #   render_error(gym.errors.full_messages)
  # end

  # def update
  #   return render json: gym if gym.update(gym_params)
  #   render_error(gym.errors.full_messages)
  # end

  # def destroy
  #   gym.destroy!
  #   head :no_content
  # end

  private

  def gym
    @gym ||= Gym.find(params[:id])
  end

  def gym_params
    params.require(:gym).permit(:name, :address, :description, :capacity)
  end
end
