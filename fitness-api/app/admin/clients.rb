# frozen_string_literal: true

ActiveAdmin.register Client do
  menu priority: 5, label: "Клиенты"

  filter :created_at
  filter :updated_at

  index do
    selectable_column
    id_column
    column :user do |client|
      if client.user
        link_to client.user.email, admin_user_path(client.user)
      else
        "Нет пользователя"
      end
    end
    column :bookings_count do |client|
      client.bookings.count
    end
    column :active_subscriptions_count do |client|
      client.client_subscriptions.active.count
    end
    column :created_at
    actions
  end

  show do
    attributes_table do
      row :id
      row :user do |client|
        if client.user
          link_to client.user.email, admin_user_path(client.user)
        else
          "Нет пользователя"
        end
      end
      row :bookings_count do |client|
        client.bookings.count
      end
      row :active_subscriptions_count do |client|
        client.client_subscriptions.active.count
      end
      row :created_at
      row :updated_at
    end

    panel "Активные подписки" do
      table_for client.client_subscriptions.active.order(created_at: :desc) do
        column :id
        column :subscription_plan do |cs|
          link_to cs.subscription_plan.name, admin_subscription_plan_path(cs.subscription_plan)
        end
        column :remaining_visits
        column :expires_at
        column :status
        column :created_at
      end
    end

    panel "Платежи" do
      table_for client.payments.order(created_at: :desc).limit(20) do
        column :id do |payment|
          link_to "Платеж ##{payment.id}", admin_payment_path(payment)
        end
        column :subscription_plan do |payment|
          link_to payment.subscription_plan.name, admin_subscription_plan_path(payment.subscription_plan)
        end
        column :amount
        column :currency
        column :status do |payment|
          status_tag payment.status
        end
        column :provider_transaction_id
        column :created_at
      end
    end

    panel "Бронирования" do
      table_for client.bookings.order(created_at: :desc).limit(20) do
        column :id
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
        column :status
        column :created_at
      end
    end
  end
end
