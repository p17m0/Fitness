# frozen_string_literal: true

ActiveAdmin.register AcsToken do
  menu parent: "ACS", label: "Токены"

  actions :index, :show

  filter :acs_device
  filter :client
  filter :booking
  filter :uid
  filter :valid_from
  filter :valid_to
  filter :remaining_uses
  filter :created_at

  index do
    selectable_column
    id_column
    column :uid
    column :acs_device do |token|
      link_to "Устройство ##{token.acs_device_id}", admin_acs_device_path(token.acs_device_id)
    end
    column :client do |token|
      token.client ? link_to("Клиент ##{token.client_id}", admin_client_path(token.client_id)) : "—"
    end
    column :booking do |token|
      token.booking ? link_to("Бронирование ##{token.booking_id}", admin_booking_path(token.booking_id)) : "—"
    end
    column :remaining_uses
    column :valid_from
    column :valid_to
    column :day_start_s
    column :day_end_s
    column :version
    column :created_at
    actions
  end

  show do
    attributes_table do
      row :id
      row :uid
      row :acs_device do |token|
        link_to "Устройство ##{token.acs_device_id}", admin_acs_device_path(token.acs_device_id)
      end
      row :client do |token|
        token.client ? link_to("Клиент ##{token.client_id}", admin_client_path(token.client_id)) : "—"
      end
      row :booking do |token|
        token.booking ? link_to("Бронирование ##{token.booking_id}", admin_booking_path(token.booking_id)) : "—"
      end
      row :valid_from
      row :valid_to
      row :day_start_s
      row :day_end_s
      row :remaining_uses
      row :version
      row :created_at
      row :updated_at
    end
  end
end
