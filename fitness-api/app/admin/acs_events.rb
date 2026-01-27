# frozen_string_literal: true

ActiveAdmin.register AcsEvent do
  menu parent: "ACS", label: "События"

  actions :index, :show

  filter :acs_device
  filter :event
  filter :uid
  filter :reader
  filter :received_at
  filter :created_at

  index do
    selectable_column
    id_column
    column :acs_device do |event|
      link_to "Устройство ##{event.acs_device_id}", admin_acs_device_path(event.acs_device_id)
    end
    column :event
    column :uid
    column :reader
    column :received_at
    column :topic
    column :created_at
    actions
  end

  show do
    attributes_table do
      row :id
      row :acs_device do |event|
        link_to "Устройство ##{event.acs_device_id}", admin_acs_device_path(event.acs_device_id)
      end
      row :event
      row :uid
      row :reader
      row :topic
      row :payload do |event|
        pre JSON.pretty_generate(event.payload || {})
      end
      row :raw_payload
      row :received_at
      row :created_at
      row :updated_at
    end
  end
end
