class CreatePayments < ActiveRecord::Migration[8.1]
  def change
    create_table :payments do |t|
      t.references :client, null: false, foreign_key: true
      t.references :subscription_plan, null: false, foreign_key: true
      t.references :client_subscription, foreign_key: true
      t.integer :amount, null: false
      t.string :currency, null: false, default: "RUB"
      t.string :status, null: false, default: "pending"
      t.string :provider, null: false, default: "cloudpayments"
      t.string :provider_transaction_id
      t.integer :provider_reason_code
      t.string :provider_message
      t.timestamps
    end

    add_index :payments, :provider_transaction_id
  end
end
