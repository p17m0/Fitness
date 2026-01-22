class CreateAcsEvents < ActiveRecord::Migration[8.1]
  def change
    create_table :acs_events do |t|
      t.references :acs_device, null: false, foreign_key: true
      t.string :event, null: false
      t.integer :ts
      t.integer :reader
      t.string :uid
      t.string :reason
      t.string :topic, null: false
      t.json :payload
      t.text :raw_payload
      t.datetime :received_at, null: false

      t.timestamps
    end

    add_index :acs_events, :event
    add_index :acs_events, :received_at
  end
end
