# frozen_string_literal: true

ActiveAdmin.register SubscriptionPlan do
  menu priority: 10, label: "Планы подписки"

  permit_params :name, :description, :visits_count, :duration_days, :price_cents, :currency

  filter :name
  filter :visits_count
  filter :duration_days
  filter :price_cents
  filter :currency
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
    column :price do |plan|
      "#{plan.price_cents / 100.0} #{plan.currency}"
    end
    column :active_subscriptions_count do |plan|
      plan.client_subscriptions.active.count
    end
    column :product do |plan|
      if plan.product
        link_to "Продукт ##{plan.product.id}", admin_product_path(plan.product)
      else
        "Нет"
      end
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
      row :price_cents
      row :price do |plan|
        "#{plan.price_cents / 100.0} #{plan.currency}"
      end
      row :currency
      row :product do |plan|
        if plan.product
          link_to "Продукт ##{plan.product.id}", admin_product_path(plan.product)
        else
          "Нет"
        end
      end
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
  end

  form do |f|
    f.inputs "План подписки" do
      f.input :name
      f.input :description, as: :text
      f.input :visits_count
      f.input :duration_days
      f.input :price_cents
      f.input :currency, as: :select, collection: ["RUB", "USD", "EUR"], default: "RUB"
    end
    f.actions
  end
end
