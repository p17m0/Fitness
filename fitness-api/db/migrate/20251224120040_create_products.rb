class CreateProducts < ActiveRecord::Migration[8.1]
  def change
    create_table :products do |t|
      t.string :name, null: false
      t.text :description
      t.integer :price_cents, null: false, default: 0
      t.string :currency, null: false, default: "RUB"
      t.references :purchasable, polymorphic: true, null: false

      t.timestamps
    end
  end
end
