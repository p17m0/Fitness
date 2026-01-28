class Api::V1::PaymentsController < Api::BaseController
  skip_before_action :authenticate_user!, only: [:three_ds_callback]

  def create
    return render_error("Только клиент", :forbidden) unless current_client
    return unless ensure_credentials!

    plan = SubscriptionPlan.find(payment_params[:subscription_plan_id])
    payment = current_client.payments.create!(
      subscription_plan: plan,
      amount: plan.price,
      currency: "RUB"
    )

    response = cloudpayments_client.charge(
      amount: payment.amount,
      currency: payment.currency,
      ip_address: request.remote_ip,
      card_cryptogram_packet: payment_params[:card_cryptogram_packet],
      name: payment_params[:cardholder_name],
      account_id: current_user.id,
      invoice_id: payment.id,
      description: "Оплата абонемента #{plan.name}"
    )

    handle_charge_response(payment, response)
  rescue ActiveRecord::RecordNotFound
    render_error("План абонемента не найден", :not_found)
  rescue ActiveRecord::RecordInvalid => e
    render_error(e.record.errors.full_messages)
  end

  def three_ds_callback
    return unless ensure_credentials!
    transaction_id = params[:MD].presence || params[:TransactionId]
    pa_res = params[:PaRes]
    payment = Payment.find_by(provider_transaction_id: transaction_id)

    unless payment
      return render plain: "Платеж не найден", status: :not_found
    end

    response = cloudpayments_client.post3ds(transaction_id: transaction_id, pa_res: pa_res)
    handle_post3ds_response(payment, response)
  rescue StandardError => e
    render plain: "Ошибка обработки 3-D Secure: #{e.message}", status: :unprocessable_entity
  end

  private

  def payment_params
    params.require(:payment).permit(:subscription_plan_id, :card_cryptogram_packet, :cardholder_name)
  end

  def cloudpayments_client
    @cloudpayments_client ||= CloudPayments::Client.new(
      public_id: cloudpayments_credentials[:public_id],
      api_secret: cloudpayments_credentials[:api_secret]
    )
  end

  def ensure_credentials!
    return true if cloudpayments_credentials[:public_id].present? && cloudpayments_credentials[:api_secret].present?

    render_error("Платежный шлюз не настроен", :unprocessable_entity)
    false
  end

  def cloudpayments_credentials
    env_key = Rails.env.to_sym
    Rails.application.credentials.dig(env_key, :cloudpayments) || {}
  end

  def handle_charge_response(payment, response)
    if response["Success"]
      transaction_id = response.dig("Model", "TransactionId") || response["TransactionId"]
      update_payment_success(payment, response, transaction_id)
      subscription = ensure_subscription(payment)
      render json: { status: "success", payment_id: payment.id, subscription_id: subscription&.id }
      return
    end

    model = response["Model"] || {}
    if model["AcsUrl"].present? && model["PaReq"].present? && model["TransactionId"].present?
      payment.update!(
        status: :requires_3ds,
        provider_transaction_id: model["TransactionId"],
        provider_reason_code: model["ReasonCode"],
        provider_message: response["Message"]
      )
      render json: {
        status: "3ds_required",
        payment_id: payment.id,
        acs_url: model["AcsUrl"],
        pa_req: model["PaReq"],
        transaction_id: model["TransactionId"],
        term_url: three_ds_term_url
      }
      return
    end

    payment.update!(
      status: :failed,
      provider_transaction_id: model["TransactionId"],
      provider_reason_code: model["ReasonCode"],
      provider_message: response["Message"]
    )
    render_error(response["Message"] || "Платеж отклонен")
  end

  def handle_post3ds_response(payment, response)
    if response["Success"]
      transaction_id = response.dig("Model", "TransactionId") || response["TransactionId"] || payment.provider_transaction_id
      update_payment_success(payment, response, transaction_id)
      ensure_subscription(payment)
      redirect_to frontend_result_url("success", payment.id)
      return
    end

    model = response["Model"] || {}
    payment.update!(
      status: :failed,
      provider_reason_code: model["ReasonCode"],
      provider_message: response["Message"]
    )
    redirect_to frontend_result_url("fail", payment.id)
  end

  def update_payment_success(payment, response, transaction_id)
    payment.update!(
      status: :paid,
      provider_transaction_id: transaction_id,
      provider_reason_code: response.dig("Model", "ReasonCode"),
      provider_message: response["Message"]
    )
  end

  def ensure_subscription(payment)
    return payment.client_subscription if payment.client_subscription.present?

    subscription = ClientSubscription.create!(
      client: payment.client,
      subscription_plan: payment.subscription_plan
    )
    payment.update!(client_subscription: subscription)
    subscription
  end

  def three_ds_term_url
    # TODO LOOKI AGAIN
    url = Rails.env.development? ? "http://localhost:3000" : ENV["BACKEND_URL"]
    "#{url}/api/v1/payments/3ds"
  end

  def frontend_result_url(status, payment_id)
    # TODO LOOKI AGAIN
    url = Rails.env.development? ? "http://localhost:5173" : ENV["FRONTEND_URL"]
    "#{url}/subscriptions?payment_status=#{status}&payment_id=#{payment_id}"
  end
end
