var Picard = require('./config/env')

Picard.globalize()

// call "helpers" to add functions or properties to the view scope
helpers({
  message: function(){
    return "Welcome to Picard!"
  },
  parity: function(num){
    return num + (num % 2 == 0 ? " is even" : " is odd")
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

// Below we make a GET request to /haml (to simulate an http service call).
// Rather than block other processing while waiting for a response,
// we attach event listeners to the request without returning a value from our callback.
// Only when the GET has returned do we render the result via the 'onScreen' method.

get('/async_example', function(params){
  var local = require('http').createClient(9900, 'localhost')
  var request = local.request('GET', '/haml', {'host': 'localhost'})
  var body = ''  
  
  request.addListener('response', function (response) {  
    response.addListener('data', function (chunk) {
      body += chunk
    })
    response.addListener('end', function(){
      params.onScreen({ body: body })
    })
  }).end()
})

get('/status/:status', function(env){
  env.onScreen({ // render a template
    status: Number(env.status), 
    template: 'advanced',
    commands: commands
  })
})
