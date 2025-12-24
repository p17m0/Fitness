class Api::V1::ProgramsController < Api::BaseController
  def index
    render json: Program.all
  end

  def show
    render json: program
  end

  def create
    record = Program.new(program_params)
    return render json: record, status: :created if record.save
    render_error(record.errors.full_messages)
  end

  def update
    return render json: program if program.update(program_params)
    render_error(program.errors.full_messages)
  end

  def destroy
    program.destroy!
    head :no_content
  end

  private

  def program
    @program ||= Program.find(params[:id])
  end

  def program_params
    params.require(:program).permit(:name, :description, :duration_minutes, :price_cents, :currency)
  end
end
