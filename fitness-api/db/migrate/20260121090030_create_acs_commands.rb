class CreateAcsCommands < ActiveRecord::Migration[8.1]
  def change
    create_table :acs_commands do |t|
      t.references :acs_device, null: false, foreign_key: true
      t.string :topic, null: false
      t.string :msg_id, null: false
      t.json :payload, null: false
      t.string :status, null: false, default: "queued"
      t.datetime :sent_at
      t.datetime :ack_at
      t.boolean :ack_ok
      t.string :ack_reason
      t.integer :retries, null: false, default: 0

      t.timestamps
    end

    add_index :acs_commands, [:acs_device_id, :msg_id], unique: true
    add_index :acs_commands, :status
  end
end
