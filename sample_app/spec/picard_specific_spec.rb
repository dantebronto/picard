require File.join(File.dirname(__FILE__), 'spec_helper')

describe 'Picard specific tests' do

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
  end
  
  describe 'partials and layouts' do
    before do
      @res = Curl::Easy.perform(base_url + '/partial')
    end
    
    it 'should render the layout' do
      @res.body_str.should include("<title>Picard v0.1 \"Prime Directive\"</title>")
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

end
