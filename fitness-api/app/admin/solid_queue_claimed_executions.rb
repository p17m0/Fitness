# frozen_string_literal: true

ActiveAdmin.register SolidQueue::ClaimedExecution do
  menu parent: "Solid Queue", label: "Захваченные"

  actions :index, :show

  filter :job_id
  filter :process_id
  filter :created_at

  index do
    selectable_column
    id_column
    column :job_id
    column :process_id
    column :created_at
    actions
  end

  show do
    attributes_table do
      row :id
      row :job_id
      row :process_id
      row :created_at
    end
  end
end
