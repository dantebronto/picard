require File.join(File.dirname(__FILE__), 'spec_helper')

describe 'GET' do
  
  it 'should do gets' do
    res = Curl::Easy.perform(base_url + '/')
    res.body_str.should eql("Hello Universe")
    res.header_str.should include('200')
  end

  it 'should do gets with normal params' do
    res = Curl::Easy.perform(base_url + '/foo/bar')
    res.body_str.should eql("bar")
    res.header_str.should include('200')
  end
  
  it 'should render a haml template' do
    res = Curl::Easy.perform(base_url + '/haml')
    res.body_str.should include('<div id="date">')
    res.body_str.should include('<div id="name">Name: Jean-Luc Picard</div>')
    res.body_str.should include('<div id="title">Title: Captain of the USS Enterprise</div>')
    res.header_str.should include('200')
  end

  it "shouldn't be bothered by trailing slashes" do
    res = Curl::Easy.perform(base_url + '/haml/')
    res.body_str.should include('<div id="name">Name: Jean-Luc Picard</div>')
    res.header_str.should include('200')
  end

  it 'should render json' do
    res = Curl::Easy.perform(base_url + '/json')
    res.body_str.should include("[{\"command\":\"Make it so\"},{\"command\":\"You have the bridge, Number One\"}]")
    res.header_str.should include('application/json')
    res.header_str.should include('200')
  end
  
  it 'should follow redirects' do
    res = Curl::Easy.perform(base_url + '/redirect')
    # rfc2616 10.3.3 Unless the request method was HEAD, the entity of the response
    # SHOULD contain a short hypertext note with a hyperlink to the new URI(s).
    res.body_str.should include('<a href="/haml">/haml</a>')
    res.header_str.should include('302')
    
    
    res = Curl::Easy.perform(base_url + '/redirect') do |opt|
      opt.follow_location = true
    end
    res.header_str.should include('200')
    res.body_str.should include('Name: Jean-Luc Picard')
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
    res.body_str.should include("<h3>foo is not defined</h3>")
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
  
  it 'should serve images' do
    res = Curl::Easy.perform(base_url + '/picard.jpg')
    img_bin = "\377\330\377\340\000\020JFIF\000\001\001\000\000\001\000\001\000\000\377\376\000>CREATOR: gd-jpeg v1.0 (using IJG JPEG v62), default quality\n\377\333\000C\000\b"
    res.body_str.include?(img_bin).should be_true
    res.header_str.should include('image/jpeg')
  end
  
end

describe 'globbing' do
  it "should slurp the remainder of the url" do
    res = Curl::Easy.perform(base_url + '/foo/bar/Ive/Been/Slurped')
    res.body_str.should eql("Globbed params for 'baz': Ive/Been/Slurped")
  end
end

describe 'general' do

  it 'should do an asynchronous GET in the callback' do
    res = Curl::Easy.perform(base_url + '/async_example')
    # response will look like /haml
    res.body_str.should include('<div id="name">Name: Jean-Luc Picard</div>')
    res.header_str.should include('200')
  end

  it 'should 404 on missing static content' do
    res = Curl::Easy.perform(base_url + '/i_dont_exist.html')
    res.body_str.should include('404')
    res.header_str.should include('404')
  end

  it 'should allow multple URL params' do
    res = Curl::Easy.perform(base_url + '/multiple/bar/baz')
    res.body_str.should eql("bar baz")
  end
end

describe 'cookies' do
  before do
    @res = Curl::Easy.perform(base_url + '/cookie')
  end

  it 'should read from a set cookie' do
    @res.body_str.should eql('<h1>literature</h1>')
  end

  it 'should set two cookies' do
    @res.header_str.should include('Set-Cookie: hobby=literature;')
    @res.header_str.should include('Set-Cookie: user=LCDR%20Data;')
  end
end

describe 'advanced haml' do
  before do
    @res = Curl::Easy.perform(base_url + '/advanced_haml')
  end

  it 'should allow for the "if" plugin' do
    @res.body_str.should include("This will show up!")
    @res.body_str.should_not include("This will not show up!")
  end

  it 'should allow for the "foreach" plugin' do
    @res.body_str.should include("<li>Make it so</li>")
    @res.body_str.should include("<li>You have the bridge, Number One</li>")
  end
  
  it 'should merge global helpers into the template scope' do
    @res.body_str.should include("Welcome to Picard!")
    @res.body_str.should include("3 is odd")
    @res.body_str.should include("4 is even")
  end
end

describe 'partials and layouts' do
  before do
    @res = Curl::Easy.perform(base_url + '/partial')
  end
  
  it 'should render the layout' do
    @res.body_str.should include('v0.2 "Shaka, when the walls fell"')
  end
  
  it 'should render the template' do
    @res.body_str.should include("This is \"partial_test.haml\" content")
  end
  
  it 'should render the first partial' do
    @res.body_str.should include("This is \"snippet.haml\" content")
  end
  
  it 'should render the partial within a partial' do
    @res.body_str.should include("This is \"sub_partial.haml\" content")
  end
  
  it 'should render commands partial' do
    @res.body_str.should include("<li>Make it so</li>")
    @res.body_str.should include("<li>You have the bridge, Number One</li>")
  end
end

describe 'route sets' do
  
  it 'should allow for path prefixes' do
    res = Curl::Easy.perform(base_url + '/ops/heartbeat')
    res.header_str.should include('200')
  end
  
  it 'should allow you to call the helpers from the controller' do
    res = Curl::Easy.perform(base_url + '/ops/heartbeat')
    res.body_str.should include("App is running")
  end
  
  it "should be able to override global helpers with a route set's helper" do
    res = Curl::Easy.perform(base_url + '/ops/version')
    res.body_str.should include("App is running")
    res.body_str.should include("Application Version")
    res.body_str.should include("v0.2")
  end
  
  it 'should allow for route sets with no name given' do
    res = Curl::Easy.perform(base_url + '/anonymous_route_set')
    res.body_str.should include("Application Version")
  end
  
  it 'should allow helpers with arguments' do
    res = Curl::Easy.perform(base_url + '/anonymous_route_set')
    res.body_str.should include("Hello")
    res.body_str.should include("Hello Bob")
  end
  
  it 'should allow inclusion of helper functions from other route_sets' do
    res = Curl::Easy.perform(base_url + '/anonymous_route_set')
    res.body_str.should include("when the walls fell")
  end
  
  it 'should allow for the local override of a route_set helper' do
    res = Curl::Easy.perform(base_url + '/anonymous_route_two')
    res.body_str.should include("123")
  end
end

describe 'error handling' do
  it 'should catch a 500 error if an error occurs during template rendering' do
    res = Curl::Easy.perform(base_url + '/anonymous_fail_route')
    res.body_str.should include("500")
    res.body_str.should include("foo is not defined")
  end
end