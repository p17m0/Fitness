# frozen_string_literal: true

ActiveAdmin.register Product do
  menu priority: 11, label: "Продукты"

  permit_params :name, :description, :price_cents, :currency, :purchasable_type, :purchasable_id

  filter :name
  filter :purchasable_type, as: :select, collection: -> { ["Program", "SubscriptionPlan"] }
  filter :price_cents
  filter :currency
  filter :created_at

  index do
    selectable_column
    id_column
    column :name
    column :description
    column :price do |product|
      "#{product.price_cents / 100.0} #{product.currency}"
    end
    column :purchasable_type
    column :purchasable do |product|
      if product.purchasable_type == "Program"
        link_to product.purchasable.name, admin_program_path(product.purchasable) if product.purchasable
      elsif product.purchasable_type == "SubscriptionPlan"
        link_to product.purchasable.name, admin_subscription_plan_path(product.purchasable) if product.purchasable
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
      row :price_cents
      row :price do |product|
        "#{product.price_cents / 100.0} #{product.currency}"
      end
      row :currency
      row :purchasable_type
      row :purchasable do |product|
        if product.purchasable_type == "Program" && product.purchasable
          link_to product.purchasable.name, admin_program_path(product.purchasable)
        elsif product.purchasable_type == "SubscriptionPlan" && product.purchasable
          link_to product.purchasable.name, admin_subscription_plan_path(product.purchasable)
        else
          "Нет"
        end
      end
      row :created_at
      row :updated_at
    end
  end

  form do |f|
    f.inputs "Продукт" do
      f.input :name
      f.input :description, as: :text
      f.input :price_cents
      f.input :currency, as: :select, collection: ["RUB", "USD", "EUR"], default: "RUB"
      f.input :purchasable_type, as: :select, collection: [["Программа", "Program"], ["План подписки", "SubscriptionPlan"]]
      f.input :purchasable_id, as: :select,
              collection: -> {
                if f.object.purchasable_type == "Program"
                  Program.all.map { |p| [p.name, p.id] }
                elsif f.object.purchasable_type == "SubscriptionPlan"
                  SubscriptionPlan.all.map { |sp| [sp.name, sp.id] }
                else
                  []
                end
              }
    end
    f.actions
  end
end
