class CreateClientSubscriptions < ActiveRecord::Migration[8.1]
  def change
    create_table :client_subscriptions do |t|
      t.references :client, null: false, foreign_key: true
      t.references :subscription_plan, null: false, foreign_key: true
      t.integer :remaining_visits, null: false, default: 0
      t.datetime :expires_at
      t.string :status, null: false, default: "active"

      t.timestamps
    end
  end
end

