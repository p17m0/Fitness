# frozen_string_literal: true

ActiveAdmin.register CoachSlot do
  menu priority: 7, label: "Слоты тренеров"

  permit_params :coach_id, :gym_slot_id, :starts_at, :ends_at, :status

  filter :coach
  filter :gym_slot
  filter :status, as: :select, collection: -> { CoachSlot.statuses }
  filter :starts_at
  filter :ends_at
  filter :created_at

  scope :all, default: true
  scope :available
  scope :booked
  scope :cancelled

  index do
    selectable_column
    id_column
    column :coach do |slot|
      link_to "Тренер ##{slot.coach_id}", admin_coach_path(slot.coach)
    end
    column :gym_slot do |slot|
      if slot.gym_slot
        link_to "Слот ##{slot.gym_slot_id}", admin_gym_slot_path(slot.gym_slot)
      else
        "Нет"
      end
    end
    column :starts_at
    column :ends_at
    column :status do |slot|
      status_tag slot.status
    end
    column :bookings_count do |slot|
      slot.bookings.count
    end
    column :created_at
    actions
  end

  show do
    attributes_table do
      row :id
      row :coach do |slot|
        link_to "Тренер ##{slot.coach_id}", admin_coach_path(slot.coach)
      end
      row :gym_slot do |slot|
        if slot.gym_slot
          link_to "Слот ##{slot.gym_slot_id}", admin_gym_slot_path(slot.gym_slot)
        else
          "Нет"
        end
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
      table_for coach_slot.bookings.order(created_at: :desc) do
        column :id
        column :client do |booking|
          link_to "Клиент ##{booking.client_id}", admin_client_path(booking.client)
        end
        column :gym_slot do |booking|
          link_to "Слот ##{booking.gym_slot_id}", admin_gym_slot_path(booking.gym_slot)
        end
        column :status do |booking|
          status_tag booking.status
        end
        column :created_at
      end
    end
  end

  form do |f|
    f.inputs "Слот тренера" do
      f.input :coach, as: :select, collection: -> { Coach.all.map { |c| ["Тренер ##{c.id}", c.id] } }
      f.input :gym_slot, as: :select, collection: -> { GymSlot.all.map { |gs| ["Слот ##{gs.id} (#{gs.gym.name})", gs.id] } }
      f.input :starts_at, as: :datetime_local
      f.input :ends_at, as: :datetime_local
      f.input :status, as: :select, collection: CoachSlot.statuses.keys.map { |s| [s.humanize, s] }
    end
    f.actions
  end

  action_item :release, only: :show, if: proc { coach_slot.booked_status? } do
    link_to "Освободить слот", release_admin_coach_slot_path(coach_slot), method: :post
  end

  member_action :release, method: :post do
    resource.release!
    redirect_to resource_path, notice: "Слот освобожден"
  end
end
