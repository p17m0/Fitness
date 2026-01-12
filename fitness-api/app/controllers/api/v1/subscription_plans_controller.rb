class Api::V1::SubscriptionPlansController < Api::BaseController
  def index
    render json: SubscriptionPlan.all
  end

  def show
    render json: subscription_plan
  end

  private

  def subscription_plan
    @subscription_plan ||= SubscriptionPlan.find(params[:id])
  end

  def subscription_plan_params
    params.require(:subscription_plan).permit(:name, :description, :visits_count, :duration_days, :price)
  end
end
