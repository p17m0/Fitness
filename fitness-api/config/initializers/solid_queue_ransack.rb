# frozen_string_literal: true

ActiveSupport.on_load(:active_record) do
  begin
    require "solid_queue"
  rescue LoadError
    # Solid Queue gem is not available.
  end

  solid_queue_models = {
    "SolidQueue::Job" => {
      attributes: %w[
        id queue_name class_name arguments priority active_job_id concurrency_key
        scheduled_at finished_at created_at updated_at
      ],
      associations: []
    },
    "SolidQueue::Process" => {
      attributes: %w[
        id kind name pid hostname metadata supervisor_id last_heartbeat_at created_at
      ],
      associations: []
    },
    "SolidQueue::ReadyExecution" => {
      attributes: %w[id job_id queue_name priority created_at],
      associations: []
    },
    "SolidQueue::ScheduledExecution" => {
      attributes: %w[id job_id queue_name priority scheduled_at created_at],
      associations: []
    },
    "SolidQueue::ClaimedExecution" => {
      attributes: %w[id job_id process_id created_at],
      associations: []
    },
    "SolidQueue::FailedExecution" => {
      attributes: %w[id job_id error created_at],
      associations: []
    },
    "SolidQueue::BlockedExecution" => {
      attributes: %w[id job_id queue_name priority concurrency_key expires_at created_at],
      associations: []
    },
    "SolidQueue::RecurringTask" => {
      attributes: %w[
        id key schedule command class_name arguments queue_name priority static
        description created_at updated_at
      ],
      associations: []
    },
    "SolidQueue::RecurringExecution" => {
      attributes: %w[id job_id task_key run_at created_at],
      associations: []
    },
    "SolidQueue::Pause" => {
      attributes: %w[id queue_name created_at],
      associations: []
    },
    "SolidQueue::Semaphore" => {
      attributes: %w[id key value expires_at created_at updated_at],
      associations: []
    }
  }

  apply_ransack = lambda do
    solid_queue_models.each do |class_name, config|
      klass = class_name.safe_constantize
      next unless klass

      klass.define_singleton_method(:ransackable_attributes) do |auth_object = nil|
        config[:attributes]
      end

      klass.define_singleton_method(:ransackable_associations) do |auth_object = nil|
        config[:associations]
      end
    end
  end

  apply_ransack.call
  ActiveSupport::Reloader.to_prepare { apply_ransack.call }
end
