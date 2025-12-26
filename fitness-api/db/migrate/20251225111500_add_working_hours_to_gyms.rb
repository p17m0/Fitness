class AddWorkingHoursToGyms < ActiveRecord::Migration[8.1]
  def change
    add_column :gyms, :opens_at, :time, null: false, default: "10:00"
    add_column :gyms, :closes_at, :time, null: false, default: "22:00"
  end
end
