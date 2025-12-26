# frozen_string_literal: true

ActiveAdmin.register User do
  menu priority: 2, label: "Пользователи"

  permit_params :email, :password, :password_confirmation, :first_name, :last_name, :phone_number,
                :roleable_type, :roleable_id

  filter :email
  filter :first_name
  filter :last_name
  filter :phone_number
  filter :roleable_type, as: :select, collection: -> { ["Client", "Coach"] }
  filter :created_at
  filter :updated_at

  index do
    selectable_column
    id_column
    column :email
    column :first_name
    column :last_name
    column :phone_number
    column :roleable_type do |user|
      user.roleable_type || "Client"
    end
    column :roleable_id
    column :created_at
    actions
  end

  show do
    attributes_table do
      row :id
      row :email
      row :first_name
      row :last_name
      row :phone_number
      row :roleable_type
      row :roleable_id
      row :roleable do |user|
        if user.roleable
          if user.roleable_type == "Client"
            link_to "Просмотр #{user.roleable_type}", admin_client_path(user.roleable)
          elsif user.roleable_type == "Coach"
            link_to "Просмотр #{user.roleable_type}", admin_coach_path(user.roleable)
          else
            "#{user.roleable_type} ##{user.roleable_id}"
          end
        else
          "Нет роли"
        end
      end
      row :created_at
      row :updated_at
    end
  end

  form do |f|
    f.inputs "Информация о пользователе" do
      f.input :email
      f.input :first_name
      f.input :last_name
      f.input :phone_number
    end

    f.inputs "Пароль" do
      f.input :password
      f.input :password_confirmation
    end

    f.inputs "Роль" do
      f.input :roleable_type, as: :select, collection: [["Клиент", "Client"], ["Тренер", "Coach"]]
      f.input :roleable_id, as: :select,
              collection: -> {
                if f.object.roleable_type == "Client"
                  Client.all.map { |c| [c.id, c.id] }
                elsif f.object.roleable_type == "Coach"
                  Coach.all.map { |c| [c.id, c.id] }
                else
                  []
                end
              }
    end

    f.actions
  end

  controller do
    def update
      if params[:user][:password].blank?
        params[:user].delete(:password)
        params[:user].delete(:password_confirmation)
      end
      super
    end
  end
end
