require 'rubygems'
require 'spec'
require 'curb'

def base_url
  'http://localhost:3000'
end

describe 'GET' do
  
  it 'should do gets' do
    res = Curl::Easy.perform(base_url + '/')
    res.body_str.should == "Hello Universe"
    res.header_str.should include('200')
  end

  it 'should do gets with normal params' do
    res = Curl::Easy.perform(base_url + '/foo/bar')
    res.body_str.should == "bar"
    res.header_str.should include('200')
  end
  
  it 'should render a haml template' do
    res = Curl::Easy.perform(base_url + '/haml')
    res.body_str.should include("<div id='date'>")
    res.body_str.should include("<div id='name'>\n          Name:\n          Jean-Luc Picard\n        </div>")
    res.body_str.should include("<div id='title'>\n          Title:\n          Captain of the USS Enterprise\n        </div>")
    res.header_str.should include('200')
  end
  
  it 'should render json' do
    res = Curl::Easy.perform(base_url + '/json')
    res.body_str.should include("[{\"command_1\":\"Make it so\"},{\"command_2\":\"You have the bridge, Number One\"}]")
    res.header_str.should include('application/json')
    res.header_str.should include('200')
  end
  
  it 'should follow redirects' do
    res = Curl::Easy.perform(base_url + '/redirect')
    res.header_str.should include('302')
    
    res = Curl::Easy.perform(base_url + '/redirect') do |opt|
      opt.follow_location = true
    end
    res.header_str.should include('200')
    res.body_str.should include("Name:\n          Jean-Luc Picard")
  end
  
  it 'should allow regular expressions' do
    res = Curl::Easy.perform(base_url + '/regex/this/that')
    res.header_str.should include('200')
    res.body_str.should eql("this that")
  end

  it 'should enforce selective regular expressions' do
    res = Curl::Easy.perform(base_url + '/selective/555')
    res.header_str.should include('200')
    res.body_str.should eql("555")
    
    res = Curl::Easy.perform(base_url + '/selective/ZZZ')
    res.header_str.should include('404')
  end

  it 'should handle exceptions' do
    res = Curl::Easy.perform(base_url + '/this_will_fail')
    res.header_str.should include('500')
    res.body_str.should include("<h1>Internal Server Error</h1>")
  end

end

describe 'POST' do
  
  it 'should do normal post' do
    res = Curl::Easy.http_post(base_url + '/order')
    res.body_str.should eql("Tea, Earl Grey, Hot")
    res.header_str.should include('200')
  end
  
  it 'should accept parameters' do
    res = Curl::Easy.http_post(base_url + '/with_params', 'foo=bar&baz=bat')
    res.body_str.should eql('<h1>bar bat</h1>')
    res.header_str.should include('200')
  end
  
end

describe 'PUT' do
  
  it 'should do normal put' do
    res = Curl::Easy.http_post(base_url + '/weapon/3', '_method=put')
    res.body_str.should eql('<p>Phaser with id #3 set to stun</p>')
    res.header_str.should include('200')
  end
  
end

describe 'DELETE' do
  
  it 'should do normal delete' do
    res = Curl::Easy.http_post(base_url + '/fire/3', '_method=delete')
    res.body_str.should eql('<p>Borg cube destroyed using 3 photon torpedoes</p>')
    res.header_str.should include('200')
  end
  
  it 'should execute any logic in the callback' do
    res = Curl::Easy.http_post(base_url + '/fire/13', '_method=delete')
    res.body_str.should eql('<h1>Maximum yield, full spread!</h1>')
  end
  
end

describe 'static assets' do
  
  it 'should serve html' do
    res = Curl::Easy.perform(base_url + '/index.html')
    res.body_str.should include('<h1>this is static content!</h1>')
    res.header_str.should include('text/html')
  end
  
  it 'should serve css' do
    res = Curl::Easy.perform(base_url + '/style.css')
    res.body_str.should include('body { background-color: black; color: #CCC; }')
    res.header_str.should include('text/css')
  end
  
  it 'should serve js' do
    res = Curl::Easy.perform(base_url + '/static.js')
    res.body_str.should include('alert')
    res.header_str.should include('application/javascript')
  end
  
end
