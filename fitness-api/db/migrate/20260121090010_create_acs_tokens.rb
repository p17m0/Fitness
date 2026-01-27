class CreateAcsTokens < ActiveRecord::Migration[8.1]
  def change
    create_table :acs_tokens do |t|
      t.references :acs_device, null: false, foreign_key: true
      t.references :client, foreign_key: true
      t.references :booking, foreign_key: true
      t.string :uid, null: false
      t.integer :valid_from, null: false
      t.integer :valid_to, null: false
      t.integer :day_start_s, null: false
      t.integer :day_end_s, null: false
      t.integer :remaining_uses, null: false
      t.integer :version, null: false, default: 1

      t.timestamps
    end

    add_index :acs_tokens, [:acs_device_id, :uid], unique: true
  end
end
