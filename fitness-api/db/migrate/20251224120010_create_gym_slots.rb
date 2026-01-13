class CreateGymSlots < ActiveRecord::Migration[8.1]
  def change
    create_table :gym_slots do |t|
      t.references :gym, null: false, foreign_key: true
      t.datetime :starts_at, null: false
      t.datetime :ends_at, null: false
      t.string :status, null: false, default: "available"

      t.timestamps
    end
  end
end
