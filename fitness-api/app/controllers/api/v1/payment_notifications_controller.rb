class Api::V1::PaymentNotificationsController < ActionController::API
  def pay
    return render plain: "Invalid signature", status: :unauthorized unless valid_signature?

    payment = find_payment
    return render plain: "Not found", status: :not_found unless payment

    payment.update!(
      status: :paid,
      provider_transaction_id: payload["TransactionId"] || payment.provider_transaction_id,
      provider_reason_code: payload["ReasonCode"],
      provider_message: payload["Message"]
    )
    ensure_subscription(payment)

    render json: { code: 0 }
  rescue StandardError => e
    render json: { code: 13, message: e.message }, status: :unprocessable_entity
  end

  def fail
    return render plain: "Invalid signature", status: :unauthorized unless valid_signature?

    payment = find_payment
    return render plain: "Not found", status: :not_found unless payment

    payment.update!(
      status: :failed,
      provider_transaction_id: payload["TransactionId"] || payment.provider_transaction_id,
      provider_reason_code: payload["ReasonCode"],
      provider_message: payload["Message"]
    )

    render json: { code: 0 }
  rescue StandardError => e
    render json: { code: 13, message: e.message }, status: :unprocessable_entity
  end

  private

  def payload
    @payload ||= JSON.parse(request.raw_post)
  rescue JSON::ParserError
    {}
  end

  def valid_signature?
    CloudPayments::Signature.valid?(
      request.raw_post,
      request.headers["Content-HMAC"],
      cloudpayments_credentials[:api_secret]
    )
  end

  def cloudpayments_credentials
    env_key = Rails.env.to_sym
    Rails.application.credentials.dig(env_key, :cloudpayments) || {}
  end

  def find_payment
    invoice_id = payload["InvoiceId"]
    return Payment.find_by(id: invoice_id) if invoice_id.present?

    Payment.find_by(provider_transaction_id: payload["TransactionId"])
  end

  def ensure_subscription(payment)
    return if payment.client_subscription.present?

    subscription = ClientSubscription.create!(
      client: payment.client,
      subscription_plan: payment.subscription_plan
    )
    payment.update!(client_subscription: subscription)
  end
end
