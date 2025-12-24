class AddPolymorphicRoleToUser < ActiveRecord::Migration[8.1]
  def change
    add_reference :users, :roleable, polymorphic: true, null: false
  end
end
