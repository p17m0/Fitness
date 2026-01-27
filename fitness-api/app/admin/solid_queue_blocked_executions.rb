# frozen_string_literal: true

ActiveAdmin.register SolidQueue::BlockedExecution do
  menu parent: "Solid Queue", label: "Блокировки"

  actions :index, :show

  filter :queue_name
  filter :job_id
  filter :priority
  filter :concurrency_key
  filter :expires_at
  filter :created_at

  index do
    selectable_column
    id_column
    column :job_id
    column :queue_name
    column :priority
    column :concurrency_key
    column :expires_at
    column :created_at
    actions
  end

  show do
    attributes_table do
      row :id
      row :job_id
      row :queue_name
      row :priority
      row :concurrency_key
      row :expires_at
      row :created_at
    end
  end
end
