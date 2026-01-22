class CreateAcsDevices < ActiveRecord::Migration[8.1]
  def change
    create_table :acs_devices do |t|
      t.string :device_id, null: false
      t.string :name
      t.references :gym, foreign_key: true
      t.datetime :last_seen_at
      t.datetime :last_heartbeat_at
      t.boolean :last_time_ok
      t.string :last_net_status
      t.string :status, null: false, default: "unknown"
      t.boolean :resync_in_progress, null: false, default: false
      t.datetime :resync_requested_at
      t.datetime :resync_started_at
      t.datetime :resync_completed_at
      t.datetime :resync_failed_at
      t.text :resync_error

      t.timestamps
    end

    add_index :acs_devices, :device_id, unique: true
  end
end
