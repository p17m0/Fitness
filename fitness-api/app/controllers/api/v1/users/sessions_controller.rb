# frozen_string_literal: true

class Api::V1::Users::SessionsController < Devise::SessionsController
  skip_before_action :verify_authenticity_token
  respond_to :json

  private

  def respond_with(resource, _opts = {})
    if resource.persisted?
      render json: { status: 'success', user: resource }, status: :created
    else
      render json: { status: 'error', errors: resource.errors.full_messages }, status: :unprocessable_entity
    end
  end
  # skip_before_action :authenticate_user!, only: [:create]
  # respond_to :json

  # def create
  #   # resource = warden.authenticate!

  #   json_response :ok, { lol: "kek" }
  # end

  # private

    # def respond_with(resource, _opts = {})
    #   user = resource&.user
    #   mfa_required = resource.mfa_required?
    #   resource.enable_email_authenticator if mfa_required & resource.is_mfa_enabled_array.blank? && user&.confirmed_at?
    #   response_body = mfa_required ? short_response(resource) : full_response(resource)
    #   json_response :ok, response_body, { no_camelize: true }
    # end

  # before_action :configure_sign_in_params, only: [:create]

  # GET /resource/sign_in
  # def new
  #   super
  # end

  # POST /resource/sign_in
  # def create
  #   super
  # end

  # DELETE /resource/sign_out
  # def destroy
  #   super
  # end

  # protected

  # If you have extra params to permit, append them to the sanitizer.
  # def configure_sign_in_params
  #   devise_parameter_sanitizer.permit(:sign_in, keys: [:attribute])
  # end
end
