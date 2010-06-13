route_set(function(){ // no name given
  
  this.helpers({
    message: function(name){
      return 'Hello ' + (name ? name : '')
    },
    version: route_sets().operations.helpers().version
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