# frozen_string_literal: true

ActiveAdmin.register Program do
  menu priority: 9, label: "Программы тренировок"

  permit_params :name, :description, :duration_minutes

  filter :name
  filter :duration_minutes
  filter :coach
  filter :created_at

  index do
    selectable_column
    id_column
    column :name
    column :description
    column :duration_minutes do |program|
      "#{program.duration_minutes} мин"
    end
    column :coach
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
      row :coach
      row :created_at
      row :updated_at
    end
  end

  form do |f|
    f.inputs "Программа тренировки" do
      f.input :name
      f.input :description, as: :text
      f.input :duration_minutes
      f.input :coach
    end
    f.actions
  end
end
