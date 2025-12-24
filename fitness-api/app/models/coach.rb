class Coach < ApplicationRecord
  has_one :user, as: :roleable, dependent: :destroy
  # has_many :clients
  # has_one :schedule
  # has_many :programs
end
