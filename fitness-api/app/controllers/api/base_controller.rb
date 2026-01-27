class Api::BaseController < ActionController::API
  before_action :authenticate_user!

  private

    # def authenticate!
    #   if current_user
    #     authenticate_user!
    #   else
    #     render json: { status: "error", message: "" }, status: 401 and return
    #   end
    # end

    def current_client
      return unless current_user&.roleable.is_a?(Client)
      current_user.roleable
    end

    def render_error(message, backtrace = nil, status = :unprocessable_entity)
      render json: { status: "error", message: message, backtrace: backtrace }, status: status
    end
end
