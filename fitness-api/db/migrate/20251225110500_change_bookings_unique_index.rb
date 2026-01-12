class ChangeBookingsUniqueIndex < ActiveRecord::Migration[8.1]
  def change
    remove_index :bookings, column: [:client_id, :gym_slot_id]
    add_index :bookings, [:client_id, :gym_slot_id],
              unique: true,
              where: "status != 'cancelled'",
              name: "index_bookings_on_client_and_gym_slot_active_only"
  end
end

