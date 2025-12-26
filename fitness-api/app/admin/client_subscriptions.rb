# frozen_string_literal: true

ActiveAdmin.register ClientSubscription do
  menu priority: 12, label: "Подписки клиентов"

  permit_params :client_id, :subscription_plan_id, :remaining_visits, :expires_at, :status

  filter :client
  filter :subscription_plan
  filter :status, as: :select, collection: -> { ClientSubscription.statuses }
  filter :remaining_visits
  filter :expires_at
  filter :created_at

  scope :all, default: true
  scope :active
  scope :expired
  scope :active_for_booking

  index do
    selectable_column
    id_column
    column :client do |cs|
      link_to "Клиент ##{cs.client_id}", admin_client_path(cs.client)
    end
    column :subscription_plan do |cs|
      link_to cs.subscription_plan.name, admin_subscription_plan_path(cs.subscription_plan)
    end
    column :remaining_visits
    column :expires_at
    column :status do |cs|
      status_tag cs.status
    end
    column :created_at
    actions
  end

  show do
    attributes_table do
      row :id
      row :client do |cs|
        link_to "Клиент ##{cs.client_id}", admin_client_path(cs.client)
      end
      row :subscription_plan do |cs|
        link_to cs.subscription_plan.name, admin_subscription_plan_path(cs.subscription_plan)
      end
      row :remaining_visits
      row :expires_at
      row :status do |cs|
        status_tag cs.status
      end
      row :active_for_booking? do |cs|
        cs.active_for_booking? ? status_tag("Да", :ok) : status_tag("Нет", :error)
      end
      row :created_at
      row :updated_at
    end
  end

  form do |f|
    f.inputs "Подписка клиента" do
      f.input :client, as: :select, collection: -> { Client.all.map { |c| ["Клиент ##{c.id}", c.id] } }
      f.input :subscription_plan, as: :select, collection: -> { SubscriptionPlan.all.map { |sp| [sp.name, sp.id] } }
      f.input :remaining_visits
      f.input :expires_at, as: :datetime_local
      f.input :status, as: :select, collection: ClientSubscription.statuses.keys.map { |s| [s.humanize, s] }
    end
    f.actions
  end

  action_item :consume_visit, only: :show, if: proc { client_subscription.active_for_booking? } do
    link_to "Использовать посещение", consume_visit_admin_client_subscription_path(client_subscription), method: :post
  end

  member_action :consume_visit, method: :post do
    begin
      resource.consume_visit!
      redirect_to resource_path, notice: "Посещение использовано. Осталось: #{resource.remaining_visits}"
    rescue => e
      redirect_to resource_path, alert: "Ошибка: #{e.message}"
    end
  end
end
