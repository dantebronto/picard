var Picard = require('../../lib/picard').start()

// Controllers are groups of routes defined via routeSet

Picard.routeSet('operations', function(){
  
  var ops = this;
  ops.pathPrefix = '/ops'
  ops.layout = 'application'
  
  ops.helpers({
    message: function(){ return "App is running" },
    version: require('../../lib/picard/server').version
  })
  
  // GET /ops/heartbeat
  ops.get('/heartbeat', function(){
    return { 
      text: ops.helpers().message(), 
      layout: 'alternate_layout' 
    } 
  })
  
  // GET /ops/version
  ops.get('/version', function(params){
    return { template: 'ops/index' }
  })
  
})

Picard.globalize()

routeSet(function(){ // no name given
  
  this.helpers({
    message: function(name){
      return 'Hello ' + (name ? name : '')
    },
    version: routeSet('operations').helpers().version
  })
  
  this.get('/anonymous_route_set', function(){
    return { template: 'ops/index' }
  })
  
  this.get('/anonymous_route_two', function(){
    return { 
      template: 'ops/index',
      version: '123'
    }
  })
  
  this.get('/anonymous_fail_route', function(){
    return {
      template: 'ops/index',
      message: function(){ 
        foo.bar // this will fail
                // foo is not defined
      }
    }
  })
})