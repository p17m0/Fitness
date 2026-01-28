# frozen_string_literal: true

ActiveAdmin.register Payment do
  menu priority: 11, label: "Платежи"

  actions :index, :show

  filter :client
  filter :subscription_plan
  filter :client_subscription
  filter :status, as: :select, collection: -> { Payment.statuses }
  filter :provider
  filter :provider_transaction_id
  filter :created_at

  index do
    selectable_column
    id_column
    column :client do |payment|
      link_to "Клиент ##{payment.client_id}", admin_client_path(payment.client)
    end
    column :subscription_plan do |payment|
      link_to payment.subscription_plan.name, admin_subscription_plan_path(payment.subscription_plan)
    end
    column :amount
    column :currency
    column :status do |payment|
      status_tag payment.status
    end
    column :provider
    column :provider_transaction_id
    column :created_at
    actions
  end

  show do
    attributes_table do
      row :id
      row :client do |payment|
        link_to "Клиент ##{payment.client_id}", admin_client_path(payment.client)
      end
      row :subscription_plan do |payment|
        link_to payment.subscription_plan.name, admin_subscription_plan_path(payment.subscription_plan)
      end
      row :client_subscription do |payment|
        if payment.client_subscription
          link_to "Подписка ##{payment.client_subscription_id}", admin_client_subscription_path(payment.client_subscription)
        else
          "Нет"
        end
      end
      row :amount
      row :currency
      row :status do |payment|
        status_tag payment.status
      end
      row :provider
      row :provider_transaction_id
      row :provider_reason_code
      row :provider_message
      row :created_at
      row :updated_at
    end
  end
end
