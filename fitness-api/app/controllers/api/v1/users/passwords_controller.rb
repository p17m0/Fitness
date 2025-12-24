# frozen_string_literal: true

class Api::V1::Users::PasswordsController < Devise::PasswordsController
  skip_before_action :verify_authenticity_token
  respond_to :json

  # GET /resource/password/new
  # def new
  #   super
  # end

  # POST /resource/password
  # def create
  #   super
  # end

  # GET /resource/password/edit?reset_password_token=abcdef
  # def edit
  #   super
  # end

  # PUT /resource/password
  # def update
  #   super
  # end

  def update
    # TODO: надо эту хуету доделать попозже
    # для этого надо организовать email smtp
    user = User.reset_password_by_token(password_update_params)

    if user.errors.empty?
      render json: { status: 'success', message: 'Password has been reset' }
    else
      render json: { status: 'error', errors: user.errors.full_messages }, status: :unprocessable_entity
    end
  end

  # protected

  # def after_resetting_password_path_for(resource)
  #   super(resource)
  # end

  # The path used after sending reset password instructions
  # def after_sending_reset_password_instructions_path_for(resource_name)
  #   super(resource_name)
  # end
  private

    def password_update_params
      params.require(:user).permit(:reset_password_token, :password, :password_confirmation)
    end
end
