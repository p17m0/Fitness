# frozen_string_literal: true

ActiveAdmin.register Program do
  menu priority: 9, label: "Программы"

  permit_params :name, :description, :duration_minutes, :price_cents, :currency

  filter :name
  filter :duration_minutes
  filter :price_cents
  filter :currency
  filter :created_at

  index do
    selectable_column
    id_column
    column :name
    column :description
    column :duration_minutes do |program|
      "#{program.duration_minutes} мин"
    end
    column :price do |program|
      "#{program.price_cents / 100.0} #{program.currency}"
    end
    column :product do |program|
      if program.product
        link_to "Продукт ##{program.product.id}", admin_product_path(program.product)
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
      row :duration_minutes do |program|
        "#{program.duration_minutes} минут"
      end
      row :price_cents
      row :price do |program|
        "#{program.price_cents / 100.0} #{program.currency}"
      end
      row :currency
      row :product do |program|
        if program.product
          link_to "Продукт ##{program.product.id}", admin_product_path(program.product)
        else
          "Нет"
        end
      end
      row :created_at
      row :updated_at
    end
  end

  form do |f|
    f.inputs "Программа" do
      f.input :name
      f.input :description, as: :text
      f.input :duration_minutes
      f.input :price_cents
      f.input :currency, as: :select, collection: ["RUB", "USD", "EUR"], default: "RUB"
    end
    f.actions
  end
end
