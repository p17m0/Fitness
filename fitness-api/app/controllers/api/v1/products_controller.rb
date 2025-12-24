class Api::V1::ProductsController < Api::BaseController
  def index
    render json: Product.where(purchasable_type: "SubscriptionPlan")
  end

  def show
    render json: product
  end

  # def create
  #   record = Product.new(product_params)
  #   return render json: record, status: :created if record.save
  #   render_error(record.errors.full_messages)
  # end

  # def update
  #   return render json: product if product.update(product_params)
  #   render_error(product.errors.full_messages)
  # end

  def destroy
    product.destroy!
    head :no_content
  end

  private

  def product
    @product ||= Product.find(params[:id])
  end

  def product_params
    params.require(:product).permit(:name, :description, :price_cents, :currency, :purchasable_type, :purchasable_id)
  end
end
