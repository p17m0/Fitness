# frozen_string_literal: true

ActiveAdmin.register SolidQueue::Semaphore do
  menu parent: "Solid Queue", label: "Семафоры"

  actions :index, :show

  filter :key
  filter :value
  filter :expires_at
  filter :created_at

  index do
    selectable_column
    id_column
    column :key
    column :value
    column :expires_at
    column :updated_at
    actions
  end

  show do
    attributes_table do
      row :id
      row :key
      row :value
      row :expires_at
      row :created_at
      row :updated_at
    end
  end
end
