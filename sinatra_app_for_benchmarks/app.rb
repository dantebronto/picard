
helpers do
  def print_date
    Date.today
  end
end

class User < Struct.new(:name, :bio)
end

get '/' do
  "Hello Universe"
end

get '/foo/:bar' do |bar|
  bar
end

get '/haml' do
  @current_user = User.new
  @current_user.name = "Jean-Luc Picard"
  @current_user.bio = "Captain of the USS Enterprise"
  haml :index
end

get '/json' do
  content_type :json
  [ 
    { :command_1 => 'Make it so' }, 
    { :command_2 => 'You have the bridge, Number One' }  
  ].to_json
end

get '/redirect' do
  redirect '/haml'
end

post '/order' do
  'Tea, Earl Grey, Hot'
end

post '/with_params' do
  "<h1>#{params[:foo]} #{params[:baz]}</h1>"
end

put '/weapon/:id' do
  "<p>Phaser with id ##{params[:id]} set to stun</p>"
end

delete '/fire/:number' do
  text = "<p>Borg cube destroyed using #{params[:number]} photon torpedoes</p>"
  if params[:number].to_i > 12
    text = "<h1>Maximum yield, full spread!</h1>"
  end
  text
end

get /\/regex\/(.*)\/(.*)/ do |cap1, cap2|
  "#{cap1} #{cap2}"
end

get /\/selective\/(\d+)/ do |cap|
  cap
end

get '/this_will_fail' do
  foo.bar
end