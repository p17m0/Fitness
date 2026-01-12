class Api::V1::ProgramsController < Api::BaseController
  def index
    render json: Program.all
  end

  def show
    render json: program
  end

  private

  def program
    @program ||= Program.find(params[:id])
  end

  def program_params
    params.require(:program).permit(:name, :description, :duration_minutes)
  end
end
