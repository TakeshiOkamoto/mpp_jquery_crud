class CreateJqueryCrudData < ActiveRecord::Migration[6.0]
  def change
    create_table :jquery_crud_data do |t|
      t.string :name
      t.text :comment

      t.timestamps
    end
  end
end
