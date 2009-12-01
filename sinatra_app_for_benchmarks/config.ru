require 'rubygems'
require 'sinatra'
require 'haml'
require 'json'


root_dir = File.dirname(__FILE__)

Sinatra::Default.set(
  :views    => File.join(root_dir, 'views'),
  :app_file => File.join(root_dir, 'blog.rb'),
  :run => false,
  :environment => :production
)

require 'app'
run Sinatra::Application
