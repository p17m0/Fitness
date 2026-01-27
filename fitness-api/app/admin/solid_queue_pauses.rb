# frozen_string_literal: true

ActiveAdmin.register SolidQueue::Pause do
  menu parent: "Solid Queue", label: "Паузы"

  actions :index, :show

  filter :queue_name
  filter :created_at

  index do
    selectable_column
    id_column
    column :queue_name
    column :created_at
    actions
  end

  show do
    attributes_table do
      row :id
      row :queue_name
      row :created_at
    end
  end
end
