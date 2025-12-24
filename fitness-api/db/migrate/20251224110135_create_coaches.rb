class CreateCoaches < ActiveRecord::Migration[8.1]
  def change
    create_table :coaches do |t|
      t.timestamps
    end
  end
end
