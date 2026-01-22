require_relative "boot"

require "rails/all"

# Require the gems listed in Gemfile, including any gems
# you've limited to :test, :development, or :production.
Bundler.require(*Rails.groups)

module FitnessApi
  class Application < Rails::Application
    # Initialize configuration defaults for originally generated Rails version.
    config.load_defaults 8.1
    config.action_controller.default_protect_from_forgery = false
    # Please, add to the `ignore` list any other `lib` subdirectories that do
    # not contain `.rb` files, or that should not be reloaded or eager loaded.
    # Common ones are `templates`, `generators`, or `middleware`, for example.
    config.autoload_lib(ignore: %w[assets tasks])

    # Configuration for the application, engines, and railties goes here.
    #
    # These settings can be overridden in specific environments using the files
    # in config/environments, which are processed later.
    #
    config.time_zone = 'Europe/Moscow'
    config.active_record.default_timezone = :utc

    # config.eager_load_paths << Rails.root.join("extras")
    allowed_origins =
        [
          'http://localhost:5173',
          'http://127.0.0.1:5173',
          'http://155.212.180.90:5173',
          'https://dev.umniy-fitness.ru',
          'http://dev.umniy-fitness.ru',
          'https://umniy-fitness.ru',
          'http://umniy-fitness.ru'
        ]

    config.middleware.insert_before 0, Rack::Cors do
      allow do
        origins allowed_origins
        resource '/api/*',
          headers: :any,
          methods: :any,
          expose: %w(Authorization),
          max_age: 600
      end
    end
  end
end
