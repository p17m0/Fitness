# frozen_string_literal: true

ActiveAdmin.register SubscriptionPlan do
  menu priority: 10, label: "Планы подписок"

  permit_params :name, :description, :visits_count, :duration_days, :price

  filter :name
  filter :visits_count
  filter :duration_days
  filter :price
  filter :created_at

  index do
    selectable_column
    id_column
    column :name
    column :description
    column :visits_count
    column :duration_days do |plan|
      "#{plan.duration_days} дней"
    end
    column :price
    column :active_subscriptions_count do |plan|
      plan.client_subscriptions.active.count
    end
    column :created_at
    actions
  end

  show do
    attributes_table do
      row :id
      row :name
      row :description
      row :visits_count
      row :duration_days do |plan|
        "#{plan.duration_days} дней"
      end
      row :price
      row :created_at
      row :updated_at
    end

    panel "Активные подписки" do
      table_for subscription_plan.client_subscriptions.active.order(created_at: :desc) do
        column :id
        column :client do |cs|
          link_to "Клиент ##{cs.client_id}", admin_client_path(cs.client)
        end
        column :remaining_visits
        column :expires_at
        column :created_at
      end
    end

    panel "Все подписки" do
      table_for subscription_plan.client_subscriptions.order(created_at: :desc).limit(20) do
        column :id
        column :client do |cs|
          link_to "Клиент ##{cs.client_id}", admin_client_path(cs.client)
        end
        column :remaining_visits
        column :status do |cs|
          status_tag cs.status
        end
        column :expires_at
        column :created_at
      end
    end

    panel "Платежи" do
      table_for subscription_plan.payments.order(created_at: :desc).limit(20) do
        column :id do |payment|
          link_to "Платеж ##{payment.id}", admin_payment_path(payment)
        end
        column :client do |payment|
          link_to "Клиент ##{payment.client_id}", admin_client_path(payment.client)
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
  end

  form do |f|
    f.inputs "План подписки" do
      f.input :name
      f.input :description, as: :text
      f.input :visits_count
      f.input :duration_days
      f.input :price
    end
    f.actions
  end
end
