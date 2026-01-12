class Api::V1::ClientSubscriptionsController < Api::BaseController
  def index
    return render_error("Только клиент", :forbidden) unless current_client
    render json: current_client.client_subscriptions.includes(:subscription_plan)
  end

  def show
    return render_error("Только клиент", :forbidden) unless current_client
    render json: current_client.client_subscriptions.find(params[:id])
  end

  def create
    # ЗДесь должна быть логика платёжки
    return render_error("Только клиент", :forbidden) unless current_client
    plan = SubscriptionPlan.find(subscription_params[:subscription_plan_id])
    record = current_client.client_subscriptions.new(subscription_params.merge(subscription_plan: plan))
    return render json: record, status: :created if record.save
    render_error(record.errors.full_messages)
  end

  private

  def subscription_params
    params.require(:client_subscription).permit(:subscription_plan_id)
  end
end
