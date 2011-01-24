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
  
  var local = require('http').createClient(9900, 'localhost'),
      request = local.request('GET', '/db'),
      body = []
  
  request.on('response', function (response) {
    response.
      on('data', function (chunk) {
        body.push(chunk)
      }).
      on('end', function(){
        // onScreen delivers the response here
        env.onScreen({ body: body.join('') })
      })
  }).end()
  
})