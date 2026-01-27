# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `bin/rails
# db:schema:load`. When creating a new database, `bin/rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema[8.1].define(version: 2026_01_21_090031) do
  create_table "acs_commands", force: :cascade do |t|
    t.datetime "ack_at"
    t.boolean "ack_ok"
    t.string "ack_reason"
    t.integer "acs_device_id", null: false
    t.datetime "created_at", null: false
    t.string "msg_id", null: false
    t.json "payload", null: false
    t.integer "retries", default: 0, null: false
    t.datetime "sent_at"
    t.string "status", default: "queued", null: false
    t.string "topic", null: false
    t.datetime "updated_at", null: false
    t.index ["acs_device_id", "msg_id"], name: "index_acs_commands_on_acs_device_id_and_msg_id", unique: true
    t.index ["acs_device_id"], name: "index_acs_commands_on_acs_device_id"
    t.index ["status"], name: "index_acs_commands_on_status"
  end

  create_table "acs_devices", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.string "device_id", null: false
    t.integer "gym_id"
    t.datetime "last_heartbeat_at"
    t.string "last_net_status"
    t.datetime "last_seen_at"
    t.boolean "last_time_ok"
    t.string "name"
    t.datetime "resync_completed_at"
    t.text "resync_error"
    t.datetime "resync_failed_at"
    t.boolean "resync_in_progress", default: false, null: false
    t.datetime "resync_requested_at"
    t.datetime "resync_started_at"
    t.string "status", default: "unknown", null: false
    t.datetime "updated_at", null: false
    t.index ["device_id"], name: "index_acs_devices_on_device_id", unique: true
    t.index ["gym_id"], name: "index_acs_devices_on_gym_id"
  end

  create_table "acs_events", force: :cascade do |t|
    t.integer "acs_device_id", null: false
    t.datetime "created_at", null: false
    t.string "event", null: false
    t.json "payload"
    t.text "raw_payload"
    t.integer "reader"
    t.string "reason"
    t.datetime "received_at", null: false
    t.string "topic", null: false
    t.integer "ts"
    t.string "uid"
    t.datetime "updated_at", null: false
    t.index ["acs_device_id"], name: "index_acs_events_on_acs_device_id"
    t.index ["event"], name: "index_acs_events_on_event"
    t.index ["received_at"], name: "index_acs_events_on_received_at"
  end

  create_table "acs_tokens", force: :cascade do |t|
    t.integer "acs_device_id", null: false
    t.integer "booking_id"
    t.integer "client_id"
    t.datetime "created_at", null: false
    t.integer "day_end_s", null: false
    t.integer "day_start_s", null: false
    t.integer "remaining_uses", null: false
    t.string "uid", null: false
    t.datetime "updated_at", null: false
    t.integer "valid_from", null: false
    t.integer "valid_to", null: false
    t.integer "version", default: 1, null: false
    t.index ["acs_device_id", "uid"], name: "index_acs_tokens_on_acs_device_id_and_uid", unique: true
    t.index ["acs_device_id"], name: "index_acs_tokens_on_acs_device_id"
    t.index ["client_id"], name: "index_acs_tokens_on_client_id"
  end

  create_table "active_admin_comments", force: :cascade do |t|
    t.integer "author_id"
    t.string "author_type"
    t.text "body"
    t.datetime "created_at", null: false
    t.string "namespace"
    t.integer "resource_id"
    t.string "resource_type"
    t.datetime "updated_at", null: false
    t.index ["author_type", "author_id"], name: "index_active_admin_comments_on_author"
    t.index ["namespace"], name: "index_active_admin_comments_on_namespace"
    t.index ["resource_type", "resource_id"], name: "index_active_admin_comments_on_resource"
  end

  create_table "admin_users", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.string "email", default: "", null: false
    t.string "encrypted_password", default: "", null: false
    t.datetime "remember_created_at"
    t.datetime "reset_password_sent_at"
    t.string "reset_password_token"
    t.datetime "updated_at", null: false
    t.index ["email"], name: "index_admin_users_on_email", unique: true
    t.index ["reset_password_token"], name: "index_admin_users_on_reset_password_token", unique: true
  end

  create_table "allowlisted_jwts", force: :cascade do |t|
    t.string "aud"
    t.datetime "exp", null: false
    t.string "jti", null: false
    t.integer "user_id", null: false
    t.index ["jti"], name: "index_allowlisted_jwts_on_jti", unique: true
    t.index ["user_id"], name: "index_allowlisted_jwts_on_user_id"
  end

  create_table "bookings", force: :cascade do |t|
    t.integer "client_id", null: false
    t.integer "coach_slot_id"
    t.datetime "created_at", null: false
    t.integer "gym_slot_id", null: false
    t.string "status", default: "booked", null: false
    t.datetime "updated_at", null: false
    t.index ["client_id", "gym_slot_id"], name: "index_bookings_on_client_and_gym_slot_active_only", unique: true, where: "status != 'cancelled'"
    t.index ["client_id"], name: "index_bookings_on_client_id"
    t.index ["coach_slot_id"], name: "index_bookings_on_coach_slot_id"
    t.index ["gym_slot_id"], name: "index_bookings_on_gym_slot_id"
  end

  create_table "client_subscriptions", force: :cascade do |t|
    t.integer "client_id", null: false
    t.datetime "created_at", null: false
    t.datetime "expires_at"
    t.integer "remaining_visits", default: 0, null: false
    t.string "status", default: "active", null: false
    t.integer "subscription_plan_id", null: false
    t.datetime "updated_at", null: false
    t.index ["client_id"], name: "index_client_subscriptions_on_client_id"
    t.index ["subscription_plan_id"], name: "index_client_subscriptions_on_subscription_plan_id"
  end

  create_table "clients", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "coach_slots", force: :cascade do |t|
    t.integer "coach_id", null: false
    t.datetime "created_at", null: false
    t.datetime "ends_at", null: false
    t.datetime "starts_at", null: false
    t.string "status", default: "available", null: false
    t.datetime "updated_at", null: false
    t.index ["coach_id", "starts_at", "ends_at"], name: "index_coach_slots_on_coach_id_and_starts_at_and_ends_at", unique: true
    t.index ["coach_id"], name: "index_coach_slots_on_coach_id"
  end

  create_table "coaches", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "gym_slots", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.datetime "ends_at", null: false
    t.integer "gym_id", null: false
    t.datetime "starts_at", null: false
    t.string "status", default: "available", null: false
    t.datetime "updated_at", null: false
    t.index ["gym_id"], name: "index_gym_slots_on_gym_id"
  end

  create_table "gyms", force: :cascade do |t|
    t.string "address", default: "", null: false
    t.integer "capacity", default: 1, null: false
    t.time "closes_at", default: "2000-01-01 22:00:00", null: false
    t.datetime "created_at", null: false
    t.text "description"
    t.string "name", null: false
    t.time "opens_at", default: "2000-01-01 10:00:00", null: false
    t.datetime "updated_at", null: false
  end

  create_table "programs", force: :cascade do |t|
    t.integer "coach_id"
    t.datetime "created_at", null: false
    t.text "description"
    t.integer "duration_minutes", default: 60, null: false
    t.string "name", null: false
    t.datetime "updated_at", null: false
    t.index ["coach_id"], name: "index_programs_on_coach_id"
  end

  create_table "subscription_plans", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.text "description"
    t.integer "duration_days", default: 30, null: false
    t.string "name", null: false
    t.integer "price", default: 0, null: false
    t.datetime "updated_at", null: false
    t.integer "visits_count", default: 1, null: false
  end

  create_table "users", force: :cascade do |t|
    t.datetime "confirmation_sent_at"
    t.string "confirmation_token"
    t.datetime "confirmed_at"
    t.datetime "created_at", null: false
    t.string "email", default: "", null: false
    t.string "encrypted_password", default: "", null: false
    t.string "first_name", default: "", null: false
    t.string "last_name", default: "", null: false
    t.string "phone_number", default: "", null: false
    t.datetime "remember_created_at"
    t.datetime "reset_password_sent_at"
    t.string "reset_password_token"
    t.integer "roleable_id"
    t.string "roleable_type"
    t.datetime "updated_at", null: false
    t.index ["email"], name: "index_users_on_email", unique: true
    t.index ["reset_password_token"], name: "index_users_on_reset_password_token", unique: true
    t.index ["roleable_type", "roleable_id"], name: "index_users_on_roleable"
  end

  add_foreign_key "acs_commands", "acs_devices"
  add_foreign_key "acs_devices", "gyms"
  add_foreign_key "acs_events", "acs_devices"
  add_foreign_key "acs_tokens", "acs_devices"
  add_foreign_key "acs_tokens", "bookings"
  add_foreign_key "acs_tokens", "clients"
  add_foreign_key "allowlisted_jwts", "users", on_delete: :cascade
  add_foreign_key "bookings", "clients"
  add_foreign_key "bookings", "coach_slots"
  add_foreign_key "bookings", "gym_slots"
  add_foreign_key "client_subscriptions", "clients"
  add_foreign_key "client_subscriptions", "subscription_plans"
  add_foreign_key "coach_slots", "coaches"
  add_foreign_key "gym_slots", "gyms"
end
