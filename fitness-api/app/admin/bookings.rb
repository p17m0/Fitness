# frozen_string_literal: true

ActiveAdmin.register Booking do
  menu priority: 8, label: "Бронирования"

  permit_params :client_id, :gym_slot_id, :coach_slot_id, :status

  filter :client
  filter :gym_slot
  filter :coach_slot
  filter :status, as: :select, collection: -> { Booking.statuses }
  filter :created_at

  scope :all, default: true
  scope :booked
  scope :cancelled

  index do
    selectable_column
    id_column
    column :client do |booking|
      link_to "Клиент ##{booking.client_id}", admin_client_path(booking.client)
    end
    column :gym_slot do |booking|
      link_to "Слот ##{booking.gym_slot_id}", admin_gym_slot_path(booking.gym_slot)
    end
    column :coach_slot do |booking|
      if booking.coach_slot
        link_to "Слот ##{booking.coach_slot_id}", admin_coach_slot_path(booking.coach_slot)
      else
        "Нет"
      end
    end
    column :status do |booking|
      status_tag booking.status
    end
    column :created_at
    actions
  end

  show do
    attributes_table do
      row :id
      row :client do |booking|
        link_to "Клиент ##{booking.client_id}", admin_client_path(booking.client)
      end
      row :gym_slot do |booking|
        link_to "Слот ##{booking.gym_slot_id}", admin_gym_slot_path(booking.gym_slot)
      end
      row :coach_slot do |booking|
        if booking.coach_slot
          link_to "Слот ##{booking.coach_slot_id}", admin_coach_slot_path(booking.coach_slot)
        else
          "Нет"
        end
      end
      row :status do |booking|
        status_tag booking.status
      end
      row :created_at
      row :updated_at
    end
  end

  form do |f|
    f.inputs "Бронирование" do
      f.input :client, as: :select, collection: -> { Client.all.map { |c| ["Клиент ##{c.id}", c.id] } }
      f.input :gym_slot, as: :select, collection: -> { GymSlot.all.map { |gs| ["Слот ##{gs.id} (#{gs.gym.name})", gs.id] } }
      f.input :coach_slot, as: :select, collection: -> { CoachSlot.all.map { |cs| ["Слот ##{cs.id}", cs.id] } }, include_blank: true
      f.input :status, as: :select, collection: Booking.statuses.keys.map { |s| [s.humanize, s] }
    end
    f.actions
  end

  action_item :cancel, only: :show, if: proc { booking.booked_status? } do
    link_to "Отменить бронирование", cancel_admin_booking_path(booking), method: :post
  end

  member_action :cancel, method: :post do
    resource.update!(status: :cancelled)
    resource.gym_slot.release! if resource.gym_slot
    resource.coach_slot.release! if resource.coach_slot
    redirect_to resource_path, notice: "Бронирование отменено"
  end
end
