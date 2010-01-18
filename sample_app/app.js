require('./config/env')

get('/', function(){
  return { text: 'Hello Universe' }
})

get('/haml', function(){
  return {
    template: 'index',
    print_date: function () {
      return (new Date()).toDateString();
    },
    current_user: {
      name: "Jean-Luc Picard",
      bio: "Captain of the USS Enterprise"
    }
  }
})

var commands = [ 
  { command: 'Make it so' }, 
  { command: 'You have the bridge, Number One' } 
]

get('/json', function(){
  return {
    type: 'application/json',
    body: JSON.stringify(commands)
  }
})

get('/advanced_haml', function(){
  return { 
    template: 'advanced',
    commands: commands // defined above
  }
})

get('/partial', function(){
  return { 
    template: 'partial_test', 
    layout: 'application',
    commands: commands
  }
})

get('/redirect/?', function(request){
  // the '?' at the end of the route 
  // makes the trailing slash optional
  return request.redirect('/haml')
})

post('/order', function(){
  return { text: 'Tea, Earl Grey, Hot' }
})

// simulate form params with:
// `curl -d "foo=bar&baz=bat" http://localhost:9900/with_params`

post('/with_params', function(params){
  return { text: '<h1>' + params.foo + ' ' + params.baz + '</h1>' }
})
 
put('/weapon/:id', function(params){
  return { text: '<p>Phaser with id #' + params.id + ' set to stun</p>' }
})
 
del('/fire/:number', function(params){  
  var text = '<p>Borg cube destroyed using ' + params.number + ' photon torpedoes</p>'
  
  if (  Number(params.number) > 12 )
    text = '<h1>Maximum yield, full spread!</h1>'
    
  return { text: text }
})

get(/\/regex\/(.*)\/(.*)/, function(params){
  return { text: params.captures[0] + ' ' + params.captures[1] }
})

get(/\/selective\/(\d+)/, function(params){ // must be a number
  return { text: params.captures[0] }
})

get('/this_will_fail', function(){
  foo.bar // foo is undefined
})

get('/cookie', function(request){

  // a simple key-value cookie
  request.cookie('hobby', 'literature')
  
  // cookie with all options
  var expires=new Date()
  expires.setDate(expires.getDate() + 30)
  
  request.cookie('user', 'LCDR Data', { 
    domain: '.your_domain.org', 
    path: '/cookie', 
    expires: expires, 
    secure: true 
  })
  
  // will render 'literature'
  return { text: '<h1>' + request.cookie('hobby').value + '</h1>' }
})

get('/foo/:bar', function(params){
  return { text: params.bar }
})

get('/multiple/:thing/:stuff', function(params){
  return { text: params.thing + " " + params.stuff }
})

// Below we make a GET request to /haml (to simulate an http service call).
// Rather than block other processing while waiting for a response,
// we attach event listeners to the request without returning a value from our callback.
// Only when the GET has returned do we render the result via the 'on_screen' method.

get('/async_example', function(params){
  
  // This could easily be a call to CouchDB or other service
  var local = require('http').createClient(9900, 'localhost')
  var request = local.request('GET', '/haml', { 'host': 'localhost' })
  
  request.finish(function(response) {
    var body = ''
    
    response.addListener('body', function (chunk) {
      body += chunk
    })
    
    // Here we call on_screen manually when the request is complete.
    // We can pass the normal scope object with body, status, template, etc.
    response.addListener('complete', function(){
      params.on_screen({ body: body })
    })
  })
})

// You can also use helper functions for logic that is shared across routes.
// Every Picard callback function gets called with a request/environment 
// variable as the single argument. Here we pass this object to our helper 
// function for evaluation:

var authorized = function(request){
  return (request.parsed_url().pathname == '/holodeck') // very simple example
}

get('/holodeck', function(request){
  if(authorized(request))
    return 'Welcome'
  else
    return request.redirect('/')
})

get('/foo/bar/*:baz', function(params) {
  return {text: "Globbed params for 'baz': " + params.baz}
})
