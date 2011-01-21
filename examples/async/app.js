var Picard = require('./config/env')

var comments = function(){
  return "Below we make a GET request to /db " +
         "(to simulate an http service call)." +
         "</br>" +
         "Rather than block other processing while " +
         "waiting for a response, we attach " +
         "event listeners to the request without " +
         "returning a value from our callback." +
         "</br>" +
         "Only when the GET has returned do we render " +
         "the result via the 'onScreen' method."
} 

Picard.get('/db', comments) // simulate a database result

Picard.get('/async', function(env){
  
  var local = require('http').createClient(9900, 'localhost')
  var request = local.request('GET', '/db', {'host': 'localhost'})
  var body = []
  
  request.addListener('response', function (response) {  
    response.addListener('data', function (chunk) {
      body.push(chunk)
    })
    response.addListener('end', function(){
      env.onScreen({ body: body.join('') }) // will be comments from above
    })
  }).end()
  
})