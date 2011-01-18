route_set('operations', function(){
  
  var ops = this;
  ops.path_prefix = '/ops'
  ops.layout = 'application'
  
  ops.helpers({
    message: function(){
      return "App is running" 
    },
    version: require('../../lib/picard/server').version
  })
  
  // GET /ops/heartbeat
  ops.get('/heartbeat', function(){
    return { text: ops.helpers().message(), layout: 'alternate_layout' } 
  })
  
  // GET /ops/version
  ops.get('/version', function(params){
    return {
      template: 'ops/index'
    }
  })
  
})