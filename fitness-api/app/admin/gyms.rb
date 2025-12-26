# frozen_string_literal: true

ActiveAdmin.register Gym do
  menu priority: 3, label: "Залы"

  permit_params :name, :address, :description, :capacity, :opens_at, :closes_at

  filter :name
  filter :address
  filter :capacity
  filter :created_at

  index do
    selectable_column
    id_column
    column :name
    column :address
    column :capacity
    column :opens_at do |gym|
      gym.opens_at.strftime("%H:%M") if gym.opens_at
    end
    column :closes_at do |gym|
      gym.closes_at.strftime("%H:%M") if gym.closes_at
    end
    column :gym_slots_count do |gym|
      gym.gym_slots.count
    end
    column :created_at
    actions
  end

  show do
    attributes_table do
      row :id
      row :name
      row :address
      row :description
      row :capacity
      row :opens_at do |gym|
        gym.opens_at.strftime("%H:%M") if gym.opens_at
      end
      row :closes_at do |gym|
        gym.closes_at.strftime("%H:%M") if gym.closes_at
      end
      row :gym_slots_count do |gym|
        gym.gym_slots.count
      end
      row :created_at
      row :updated_at
    end

    panel "Слоты зала" do
      table_for gym.gym_slots.order(starts_at: :desc).limit(20) do
        column :id
        column :starts_at
        column :ends_at
        column :status
        column :bookings_count do |slot|
          slot.bookings.count
        end
      end
    end
  end

  form do |f|
    f.inputs "Информация о зале" do
      f.input :name
      f.input :address
      f.input :description, as: :text
      f.input :capacity
      f.input :opens_at, as: :time_select, minute_step: 15
      f.input :closes_at, as: :time_select, minute_step: 15
    end
    f.actions
  end
end
