require('../../lib/picard').

// Many top-level functions return 'this', allowing
// for chaining of routes without calling Picard.globalize()

error(function(ex){ // custom error handler, takes an exception arg
  this.onScreen({
    status: 500, 
    body: '<h1> Custom 500 Error! </h1>' +
      '<h3>' + ex.message + '</h3>' +
      '<pre>' + ex.stack + '</pre>'
  })
  require('sys').puts(ex.stack)
}).

notFound(function(){ // custom 404 action
  this.onScreen({
    status: 404,
    body: '<h1> Custom 404! </h1>'
  })
}).

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

get('/passing/:blah', function(env){ // pass to the next matching route handler
  env.pass()                         // don't return if passing
}).

get('/passing/to_me', function(){
  return 'passed from previous route'
}).

get('/throws/error', function(){
  return foo.bar // not defined
}).

start()