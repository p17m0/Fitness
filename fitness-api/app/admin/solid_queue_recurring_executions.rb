# frozen_string_literal: true

ActiveAdmin.register SolidQueue::RecurringExecution do
  menu parent: "Solid Queue", label: "Регулярные исполнения"

  actions :index, :show

  filter :task_key
  filter :job_id
  filter :run_at
  filter :created_at

  index do
    selectable_column
    id_column
    column :task_key
    column :job_id
    column :run_at
    column :created_at
    actions
  end

  show do
    attributes_table do
      row :id
      row :task_key
      row :job_id
      row :run_at
      row :created_at
    end
  end
end
