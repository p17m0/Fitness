class ApplicationRecord < ActiveRecord::Base
  primary_abstract_class

  def self.ransackable_attributes(auth_object = nil)
    self.column_names
  end
end
