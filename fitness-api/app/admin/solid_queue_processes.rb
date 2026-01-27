# frozen_string_literal: true

ActiveAdmin.register SolidQueue::Process do
  menu parent: "Solid Queue", label: "Процессы"

  actions :index, :show

  filter :kind
  filter :name
  filter :pid
  filter :hostname
  filter :last_heartbeat_at
  filter :created_at

  index do
    selectable_column
    id_column
    column :kind
    column :name
    column :pid
    column :hostname
    column :last_heartbeat_at
    column :supervisor_id
    column :created_at
    actions
  end

  show do
    attributes_table do
      row :id
      row :kind
      row :name
      row :pid
      row :hostname
      row :metadata do |process|
        pre JSON.pretty_generate(process.metadata || {})
      end
      row :supervisor_id
      row :last_heartbeat_at
      row :created_at
    end
  end
end
