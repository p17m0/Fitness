class CreateSubscriptionPlans < ActiveRecord::Migration[8.1]
  def change
    create_table :subscription_plans do |t|
      t.string :name, null: false
      t.text :description
      t.integer :visits_count, null: false, default: 1
      t.integer :duration_days, null: false, default: 30
      t.integer :price, null: false, default: 0

      t.timestamps
    end
  end
end
