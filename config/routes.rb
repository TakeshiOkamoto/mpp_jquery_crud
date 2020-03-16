Rails.application.routes.draw do
  
  # ルート
  root to: 'jquery_crud_data#index'

  get    'jquery_crud_data/index'  
  get    'jquery_crud_data/new',  to: 'jquery_crud_data#new',     as: 'new_jquery_crud_data'
  post   'jquery_crud_data',      to: 'jquery_crud_data#create'
  put    'jquery_crud_data/:id',  to: 'jquery_crud_data#update'
  delete 'jquery_crud_data/:id',  to: 'jquery_crud_data#destroy'
end
