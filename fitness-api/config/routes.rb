Rails.application.routes.draw do
  devise_for :admin_users, ActiveAdmin::Devise.config
  ActiveAdmin.routes(self)

  devise_for :users,
    path: 'api/v1/users',
    controllers: {
      sessions: 'api/v1/users/sessions',
      registrations: 'api/v1/users/registrations',
      passwords: 'api/v1/users/passwords'
    },
    defaults: { format: :json }

  namespace :api do
    namespace :v1 do
      resources :gyms
      resources :gym_slots
      resources :programs
      resources :subscription_plans
      resources :products
      resources :coach_slots
      resources :client_subscriptions, only: [:index, :show, :create]
      resources :bookings, only: [:index, :create, :destroy]
      resources :coaches, only: [:index]
    end
  end

  # Define your application routes per the DSL in https://guides.rubyonrails.org/routing.html

  # Reveal health status on /up that returns 200 if the app boots with no exceptions, otherwise 500.
  # Can be used by load balancers and uptime monitors to verify that the app is live.
  get "up" => "rails/health#show", as: :rails_health_check

  # Render dynamic PWA files from app/views/pwa/* (remember to link manifest in application.html.erb)
  # get "manifest" => "rails/pwa#manifest", as: :pwa_manifest
  # get "service-worker" => "rails/pwa#service_worker", as: :pwa_service_worker

  # Defines the root path route ("/")
  # root "posts#index"
end
