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
  { name: "Малый зал", address: "Улица Спорта, 2", description: "Небольшой зал", capacity: 15 }
].map do |attrs|
  Gym.find_or_create_by!(name: attrs[:name], address: attrs[:address]) do |gym|
    gym.description = attrs[:description]
    gym.capacity = attrs[:capacity]
    gym.opens_at = Time.zone.parse("08:00")
    gym.closes_at = Time.zone.parse("22:00")
  end
end

gyms.each do |gym|
  device = AcsDevice.find_or_initialize_by(gym: gym)
  if device.new_record?
    device.device_id = "acs-#{gym.id}"
    device.name = "ACS #{gym.name}"
  else
    device.device_id ||= "ram-01"
    device.name ||= "ACS #{gym.name}"
  end
  device.save! if device.changed?
end

subscription_plans = [
  { name: "5 посещений", description: "На месяц", visits_count: 5, duration_days: 30, price: 29900 },
  { name: "10 посещений", description: "На два месяца", visits_count: 10, duration_days: 60, price: 49900 }
].map do |attrs|
  SubscriptionPlan.find_or_create_by!(name: attrs[:name]) { |sp| sp.assign_attributes(attrs) }
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

programs = [
  { name: "Фитнес базовый", description: "3 раза в неделю", duration_minutes: 60, coach: coach },
  { name: "Силовая", description: "2 раза в неделю", duration_minutes: 90, coach: coach }
].map do |attrs|
  Program.find_or_create_by!(name: attrs[:name]) { |p| p.assign_attributes(attrs) }
end


plan = subscription_plans.first
ClientSubscription.create(client: client, subscription_plan: plan, status: "active") do |cs|
  cs.remaining_visits = plan.visits_count
  cs.expires_at = Time.current + plan.duration_days.days
  cs.status = "active"
end

# Генерируем слоты залов на ближайшие дни
gyms.each do |gym|
  GymSlots::Generator.new(gym: gym, from: Date.current, to: Date.current + 7.days).call
end

# Генерируем слоты тренера только для первого зала (тренер не может быть в двух местах одновременно)
CoachSlots::Generator.new(coach: coach, gym: gyms.first, from: Date.current, to: Date.current + 7.days).call

puts "Создано #{GymSlot.count} слотов залов"
puts "Создано #{CoachSlot.count} слотов тренеров"
