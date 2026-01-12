class CreatePrograms < ActiveRecord::Migration[8.1]
  def change
    create_table :programs do |t|
      t.string :name, null: false
      t.text :description
      t.integer :duration_minutes, null: false, default: 60
      t.references :coach, foreign_key: true

      t.timestamps
    end
  end
end
