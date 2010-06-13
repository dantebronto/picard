route_set('operations', function(){
  
  var ops = this;
  ops.path_prefix = '/ops'
  
  ops.helpers({
    message: function(){
      return "App is running" 
    },
    version: Picard.version
  })
  
  // GET /ops/heartbeat
  ops.get('/heartbeat', function(){
    return { text: ops.helpers().message() } 
  })
  
  // GET /ops/version
  ops.get('/version', function(params){
    return {
      template: 'ops/index'
    }
  })
  
})