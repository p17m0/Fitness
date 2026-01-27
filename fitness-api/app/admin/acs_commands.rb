# frozen_string_literal: true

ActiveAdmin.register AcsCommand do
  menu parent: "ACS", label: "Команды"

  actions :index, :show

  filter :acs_device
  filter :status, as: :select, collection: -> { AcsCommand.statuses.keys }
  filter :topic
  filter :msg_id
  filter :created_at
  filter :sent_at
  filter :ack_at

  index do
    selectable_column
    id_column
    column :acs_device do |command|
      link_to "Устройство ##{command.acs_device_id}", admin_acs_device_path(command.acs_device_id)
    end
    column :status do |command|
      status_tag command.status
    end
    column :topic
    column :msg_id
    column :retries
    column :sent_at
    column :ack_at
    column :created_at
    actions
  end

  show do
    attributes_table do
      row :id
      row :acs_device do |command|
        link_to "Устройство ##{command.acs_device_id}", admin_acs_device_path(command.acs_device_id)
      end
      row :status do |command|
        status_tag command.status
      end
      row :topic
      row :msg_id
      row :payload do |command|
        pre JSON.pretty_generate(command.payload || {})
      end
      row :retries
      row :sent_at
      row :ack_at
      row :ack_ok
      row :ack_reason
      row :created_at
      row :updated_at
    end
  end
end
