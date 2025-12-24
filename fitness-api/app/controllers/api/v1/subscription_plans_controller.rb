class Api::V1::SubscriptionPlansController < Api::BaseController
  def index
    render json: SubscriptionPlan.all
  end

  def show
    render json: subscription_plan
  end

  def create
    record = SubscriptionPlan.new(subscription_plan_params)
    return render json: record, status: :created if record.save
    render_error(record.errors.full_messages)
  end

  def update
    return render json: subscription_plan if subscription_plan.update(subscription_plan_params)
    render_error(subscription_plan.errors.full_messages)
  end

  def destroy
    subscription_plan.destroy!
    head :no_content
  end

  private

  def subscription_plan
    @subscription_plan ||= SubscriptionPlan.find(params[:id])
  end

  def subscription_plan_params
    params.require(:subscription_plan).permit(:name, :description, :visits_count, :duration_days, :price_cents, :currency)
  end
end
