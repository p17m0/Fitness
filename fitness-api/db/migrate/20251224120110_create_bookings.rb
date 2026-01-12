class CreateBookings < ActiveRecord::Migration[8.1]
  def change
    create_table :bookings do |t|
      t.references :client, null: false, foreign_key: true
      t.references :gym_slot, null: false, foreign_key: true
      t.references :coach_slot, foreign_key: true
      t.string :status, null: false, default: "booked"

      t.timestamps
    end

    add_index :bookings, [:client_id, :gym_slot_id], unique: true
  end
end

