# frozen_string_literal: true

ActiveAdmin.register SolidQueue::RecurringTask do
  menu parent: "Solid Queue", label: "Регулярные задачи"

  actions :index, :show

  filter :key
  filter :schedule
  filter :class_name
  filter :queue_name
  filter :static
  filter :created_at

  index do
    selectable_column
    id_column
    column :key
    column :schedule
    column :class_name
    column :queue_name
    column :priority
    column :static
    column :updated_at
    actions
  end

  show do
    attributes_table do
      row :id
      row :key
      row :schedule
      row :command
      row :class_name
      row :arguments do |task|
        pre JSON.pretty_generate(task.arguments || {})
      end
      row :queue_name
      row :priority
      row :static
      row :description
      row :created_at
      row :updated_at
    end
  end
end
