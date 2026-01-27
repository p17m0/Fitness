# frozen_string_literal: true

ActiveAdmin.register SolidQueue::ReadyExecution do
  menu parent: "Solid Queue", label: "Готовые"

  actions :index, :show

  filter :queue_name
  filter :job_id
  filter :priority
  filter :created_at

  index do
    selectable_column
    id_column
    column :job_id
    column :queue_name
    column :priority
    column :created_at
    actions
  end

  show do
    attributes_table do
      row :id
      row :job_id
      row :queue_name
      row :priority
      row :created_at
    end
  end
end
