class CreateCoachSlots < ActiveRecord::Migration[8.1]
  def change
    create_table :coach_slots do |t|
      t.references :coach, null: false, foreign_key: true
      t.datetime :starts_at, null: false
      t.datetime :ends_at, null: false
      t.string :status, null: false, default: "available"

      t.timestamps
    end

    add_index :coach_slots, [:coach_id, :starts_at, :ends_at], unique: true
  end
end
