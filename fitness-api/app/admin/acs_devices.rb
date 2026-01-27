# frozen_string_literal: true

ActiveAdmin.register AcsDevice do
  menu parent: "ACS", label: "Устройства"

  actions :index, :show

  filter :device_id
  filter :status, as: :select, collection: -> { AcsDevice.statuses.keys }
  filter :gym
  filter :last_seen_at
  filter :last_heartbeat_at
  filter :created_at

  index do
    selectable_column
    id_column
    column :device_id
    column :status do |device|
      status_tag device.status
    end
    column :gym do |device|
      device.gym ? link_to(device.gym.name, admin_gym_path(device.gym)) : "—"
    end
    column :name
    column :last_seen_at
    column :last_heartbeat_at
    column :resync_in_progress
    column :updated_at
    actions
  end

  show do
    attributes_table do
      row :id
      row :device_id
      row :status do |device|
        status_tag device.status
      end
      row :gym do |device|
        device.gym ? link_to(device.gym.name, admin_gym_path(device.gym)) : "—"
      end
      row :name
      row :last_net_status
      row :last_seen_at
      row :last_heartbeat_at
      row :last_time_ok
      row :resync_in_progress
      row :resync_requested_at
      row :resync_started_at
      row :resync_completed_at
      row :resync_failed_at
      row :resync_error
      row :created_at
      row :updated_at
    end
  end
end
