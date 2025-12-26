# frozen_string_literal: true

ActiveAdmin.register GymSlot do
  menu priority: 6, label: "Слоты залов"

  permit_params :gym_id, :starts_at, :ends_at, :status

  filter :gym
  filter :status, as: :select, collection: -> { GymSlot.statuses }
  filter :starts_at
  filter :ends_at
  filter :created_at

  scope :all, default: true
  scope :available
  scope :booked
  scope :cancelled
  scope :upcoming

  index do
    selectable_column
    id_column
    column :gym do |slot|
      link_to slot.gym.name, admin_gym_path(slot.gym)
    end
    column :starts_at
    column :ends_at
    column :status do |slot|
      status_tag slot.status
    end
    column :bookings_count do |slot|
      slot.bookings.count
    end
    column :coach_slots_count do |slot|
      slot.coach_slots.count
    end
    column :created_at
    actions
  end

  show do
    attributes_table do
      row :id
      row :gym do |slot|
        link_to slot.gym.name, admin_gym_path(slot.gym)
      end
      row :starts_at
      row :ends_at
      row :status do |slot|
        status_tag slot.status
      end
      row :created_at
      row :updated_at
    end

    panel "Бронирования" do
      table_for gym_slot.bookings.order(created_at: :desc) do
        column :id
        column :client do |booking|
          link_to "Клиент ##{booking.client_id}", admin_client_path(booking.client)
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
      end
    end

    panel "Слоты тренеров" do
      table_for gym_slot.coach_slots.order(created_at: :desc) do
        column :id
        column :coach do |slot|
          link_to "Тренер ##{slot.coach_id}", admin_coach_path(slot.coach)
        end
        column :starts_at
        column :ends_at
        column :status do |slot|
          status_tag slot.status
        end
      end
    end
  end

  form do |f|
    f.inputs "Слот зала" do
      f.input :gym, as: :select, collection: -> { Gym.all.map { |g| [g.name, g.id] } }
      f.input :starts_at, as: :datetime_local
      f.input :ends_at, as: :datetime_local
      f.input :status, as: :select, collection: GymSlot.statuses.keys.map { |s| [s.humanize, s] }
    end
    f.actions
  end

  action_item :release, only: :show, if: proc { gym_slot.booked_status? } do
    link_to "Освободить слот", release_admin_gym_slot_path(gym_slot), method: :post
  end

  member_action :release, method: :post do
    resource.release!
    redirect_to resource_path, notice: "Слот освобожден"
  end
end
