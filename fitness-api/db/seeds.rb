# This file should ensure the existence of records required to run the application in every environment (production,
# development, test). The code here should be idempotent so that it can be executed at any point in every environment.
# The data can then be loaded with the bin/rails db:seed command (or created alongside the database with db:setup).
#
# Example:
#
#   ["Action", "Comedy", "Drama", "Horror"].each do |genre_name|
#     MovieGenre.find_or_create_by!(name: genre_name)
#   end
if Rails.env.development?
  AdminUser.find_or_create_by!(email: 'admin@example.com') do |admin|
    admin.password = 'password'
    admin.password_confirmation = 'password'
  end
end

gyms = [
  { name: "Главный зал", address: "Улица Спорта, 1", description: "Основной зал", capacity: 30 },
  { name: "Малый зал", address: "Улица Спорта, 2", description: "Небольшой зал", capacity: 15 }
].map do |attrs|
  Gym.find_or_create_by!(name: attrs[:name], address: attrs[:address]) do |gym|
    gym.description = attrs[:description]
    gym.capacity = attrs[:capacity]
  end
end

programs = [
  { name: "Фитнес базовый", description: "3 раза в неделю", duration_minutes: 60, price_cents: 19900, currency: "RUB" },
  { name: "Силовая", description: "2 раза в неделю", duration_minutes: 90, price_cents: 29900, currency: "RUB" }
].map do |attrs|
  Program.find_or_create_by!(name: attrs[:name]) { |p| p.assign_attributes(attrs) }
end

subscription_plans = [
  { name: "5 посещений", description: "На месяц", visits_count: 5, duration_days: 30, price_cents: 29900, currency: "RUB" },
  { name: "10 посещений", description: "На два месяца", visits_count: 10, duration_days: 60, price_cents: 49900, currency: "RUB" }
].map do |attrs|
  SubscriptionPlan.find_or_create_by!(name: attrs[:name]) { |sp| sp.assign_attributes(attrs) }
end

(programs + subscription_plans).each do |purchasable|
  Product.find_or_create_by!(purchasable: purchasable) do |product|
    product.name = purchasable.name
    product.description = purchasable.try(:description)
    product.price_cents = purchasable.price_cents
    product.currency = purchasable.currency
  end
end

client = Client.create
client_user = User.find_or_create_by!(email: "client@example.com") do |user|
  user.password = "password"
  user.password_confirmation = "password"
  user.phone_number = "+70000000001"
  user.first_name = "Иван"
  user.last_name = "Иванов"
  user.roleable = client
end

coach = Coach.create
coach_user = User.find_or_create_by!(email: "coach@example.com") do |user|
  user.password = "password"
  user.password_confirmation = "password"
  user.phone_number = "+70000000002"
  user.first_name = "Петр"
  user.last_name = "Петров"
  user.roleable = coach
end

plan = subscription_plans.first
ClientSubscription.create(client: client, subscription_plan: plan, status: "active") do |cs|
  cs.remaining_visits = plan.visits_count
  cs.expires_at = Time.current + plan.duration_days.days
  cs.status = "active"
end

today = Time.current.change(min: 0, sec: 0)
gym_slots = [
  { gym: gyms.first, starts_at: today + 2.hours, ends_at: today + 3.hours },
  { gym: gyms.first, starts_at: today + 4.hours, ends_at: today + 5.hours },
  { gym: gyms.last, starts_at: today + 2.hours, ends_at: today + 3.hours }
].map do |attrs|
  GymSlot.find_or_create_by!(gym: attrs[:gym], starts_at: attrs[:starts_at], ends_at: attrs[:ends_at]) do |slot|
    slot.status = "available"
  end
end

CoachSlot.find_or_create_by!(coach: coach, starts_at: gym_slots.first.starts_at, ends_at: gym_slots.first.ends_at) do |slot|
  slot.gym_slot = gym_slots.first
  slot.status = "available"
end
