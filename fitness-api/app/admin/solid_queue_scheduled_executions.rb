# frozen_string_literal: true

ActiveAdmin.register SolidQueue::ScheduledExecution do
  menu parent: "Solid Queue", label: "Запланированные"

  actions :index, :show

  filter :queue_name
  filter :job_id
  filter :priority
  filter :scheduled_at
  filter :created_at

  index do
    selectable_column
    id_column
    column :job_id
    column :queue_name
    column :priority
    column :scheduled_at
    column :created_at
    actions
  end

  show do
    attributes_table do
      row :id
      row :job_id
      row :queue_name
      row :priority
      row :scheduled_at
      row :created_at
    end
  end
end
