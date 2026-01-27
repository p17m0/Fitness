# frozen_string_literal: true

ActiveAdmin.register SolidQueue::FailedExecution do
  menu parent: "Solid Queue", label: "Ошибки"

  actions :index, :show

  filter :job_id
  filter :created_at

  index do
    selectable_column
    id_column
    column :job_id
    column :created_at
    actions
  end

  show do
    attributes_table do
      row :id
      row :job_id
      row :error do |execution|
        pre execution.error.to_s
      end
      row :created_at
    end
  end
end
