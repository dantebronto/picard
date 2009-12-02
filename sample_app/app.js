require('./config/env')

get('/', function(){
  return { text: 'Hello Universe' }
})

get('/foo/:bar', function(params){
  return { text: params.bar }
})

get('/haml', function(){
  var scope = {
    template: 'index.haml', 
    print_date: function () {
      return (new Date()).toDateString();
    },
    current_user: {
      name: "Jean-Luc Picard",
      bio: "Captain of the USS Enterprise"
    }
  };
  return scope
})

get('/json', function(){
  return {
    type: 'application/json',
    body: JSON.stringify( 
      [ { command_1: 'Make it so' },
        { command_2: 'You have the bridge, Number One' } ] )
  }
})

get('/redirect/?', function(){ // the '?' at the end of the route makes the trailing slash optional
  return {  headers: { location: '/haml' }, status: 302 }
})

post('/order', function(){
  return { text: 'Tea, Earl Grey, Hot' }
})

// simulate form params with `curl -d "foo=bar&baz=bat" http://localhost:9900/with_params`
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

// Below we make a GET request to Google.
// Rather than block other processing while waiting for a response,
// we add callbacks on the request and return simply 'async'.

// Only when the GET has returned do we render the result via the 'on_screen' method.

get('/async_example', function(params){
  
  // This could easily be a call to CouchDB or other service
  var google = require('http').createClient(80, "www.google.com")
  var request = google.get("/", { "host": "www.google.com" })
  
  request.finish(function(response) {
    var body = ''
    
    response.addListener('body', function (chunk) {
      body += chunk
    })
    
    response.addListener('complete', function(){
      // Here we call on_screen manually when the request is complete.
      // We can pass the normal scope object with body, status, template, etc.
      params.on_screen({ body: body })
    })
  })
  
  return 'async' // tell Picard not to call to on_screen, we will
})