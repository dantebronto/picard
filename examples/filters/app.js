var Picard = require('../../lib/picard')

// Filters are only available in Route Sets, for performance reasons

Picard.routeSet('simple', function(){
  
  var self = this
  
  self.before(function(env){
    env.foo = 'Foo' // set var on env for use later in filter chain or in main handler
    return true     // as long as you return something here, action will continue
  })
  
  self.before(function(env){
    process.nextTick(function(){ // Simulate some async action,
      env.filterDone()           // call filterDone when complete.
    })                           
  })                             
  
  self.get('/', function(env){              // After an async filter you'll need to call 
    env.onScreen('Hello, ' + env.foo + '!') // onScreen in your route handler (instead of returning)
  })
  
})

Picard.routeSet('selective', function(){
  
  this.before(/snappy/, function(env){ // can take RegExp or string as first argument
    if ( env.cookie('session_id') || env.parsedUrl().query['session_id'] ){ // contrived example
      return true // pass to the 'snappy_path'
    } else {
      env.redirect('/login')
      return false
    }
  })
  
  this.get('/snappy_path', function(env){
    env.onScreen('Hello from the snappy path!') // After an async filter you'll need 
  })                                            // to call onScreen in your route handler
  
  this.get('/login', function(){
    return '<a href="/snappy_path?session_id=' + new Date().getTime() + '">fake login</a>'
  })
  
})

Picard.start()