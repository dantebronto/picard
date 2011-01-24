require('../../lib/picard').

// Many top-level functions return 'this', allowing
// for chaining of routes without calling Picard.globalize()

// process a posted form
post('/with_params', function(params){
  return { text: '<h1>' + params.foo + ' ' + params.baz + '</h1>' }
}).

put('/weapon/:id', function(params){
  return { text: '<p>Phaser with id #' + params.id + ' set to stun</p>' }
}).

del('/fire/:number', function(params){  
  var text = '<p>Borg cube destroyed using ' + params.number + ' photon torpedoes</p>'
  
  if (  Number(params.number) > 12 )
    text = '<h1>Maximum yield, full spread!</h1>'
    
  return { text: text }
}).

get('/returns_string', function(){
  return 'this is the response'
}).

get('/returns_triplet', function(){
  headers = [
    [ 'content-type', 'application/foo' ],
    [ 'custom-header', 'cool']
  ]
  // scope can be an array like [status, headers, body]
  return [201, headers, 'this is the response']
}).

get('/passing/:blah', function(env){
  env.pass() // pass to the next matching route handler
}).

get('/passing/to_me', function(){
  return 'passed from previous route'
}).

start()