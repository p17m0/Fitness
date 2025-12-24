class CreateGyms < ActiveRecord::Migration[8.1]
  def change
    create_table :gyms do |t|
      t.string :name, null: false
      t.string :address, null: false, default: ""
      t.text :description
      t.integer :capacity, null: false, default: 1

      t.timestamps
    end
  end
end

