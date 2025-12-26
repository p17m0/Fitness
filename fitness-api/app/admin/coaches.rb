# frozen_string_literal: true

ActiveAdmin.register Coach do
  menu priority: 4, label: "Тренеры"

  filter :created_at
  filter :updated_at

  index do
    selectable_column
    id_column
    column :user do |coach|
      if coach.user
        link_to coach.user.email, admin_user_path(coach.user)
      else
        "Нет пользователя"
      end
    end
    column :coach_slots_count do |coach|
      coach.coach_slots.count
    end
    column :created_at
    actions
  end

  show do
    attributes_table do
      row :id
      row :user do |coach|
        if coach.user
          link_to coach.user.email, admin_user_path(coach.user)
        else
          "Нет пользователя"
        end
      end
      row :coach_slots_count do |coach|
        coach.coach_slots.count
      end
      row :created_at
      row :updated_at
    end

    panel "Слоты тренера" do
      table_for coach.coach_slots.order(starts_at: :desc).limit(20) do
        column :id
        column :starts_at
        column :ends_at
        column :status
        column :gym_slot_id
        column :bookings_count do |slot|
          slot.bookings.count
        end
      end
    end
  end
end
