class CreatePrograms < ActiveRecord::Migration[8.1]
  def change
    create_table :programs do |t|
      t.string :name, null: false
      t.text :description
      t.integer :duration_minutes, null: false, default: 60
      t.integer :price_cents, null: false, default: 0
      t.string :currency, null: false, default: "RUB"

      t.timestamps
    end
  end
end
