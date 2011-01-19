var Picard = require('../../lib/picard').start()

Picard.get('/foo/:bar', function(params){
  return { text: params.bar }
})

Picard.get('/multiple/:thing/:stuff', function(params){
  return { text: params.thing + " " + params.stuff }
})

Picard.get(/\/regex\/(.*)\/(.*)/, function(params){
  return { text: params.captures[0] + ' ' + params.captures[1] }
})

Picard.get(/\/selective\/(\d+)/, function(params){ // must be a number
  return { text: params.captures[0] }
})

Picard.get('/get_with_params', function(env){  // called with ?foo=bar&baz=bat
  var query = env.parsedUrl().query            // access querystring
  return { text: query.foo + " " + query.baz }
})

Picard.get('/foo/bar/*:baz', function(params) {
  return { text: "Globbed params for 'baz': " + params.baz }
})