# frozen_string_literal: true

ActiveAdmin.register SolidQueue::Job do
  menu parent: "Solid Queue", label: "Задачи"

  actions :index, :show

  filter :queue_name
  filter :class_name
  filter :active_job_id
  filter :priority
  filter :scheduled_at
  filter :finished_at
  filter :created_at

  index do
    selectable_column
    id_column
    column :queue_name
    column :class_name
    column :priority
    column :active_job_id
    column :scheduled_at
    column :finished_at
    column :created_at
    actions
  end

  show do
    attributes_table do
      row :id
      row :queue_name
      row :class_name
      row :priority
      row :active_job_id
      row :concurrency_key
      row :arguments do |job|
        pre JSON.pretty_generate(job.arguments || {})
      end
      row :scheduled_at
      row :finished_at
      row :created_at
      row :updated_at
    end
  end
end
