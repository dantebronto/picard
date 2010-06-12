route_set('Operations Routes', function(){
  
  var ops = this;
  ops.path_prefix = '/ops'
  
  // ops.helpers({
  //   bark: function(){
  //     return "App is running" 
  //   }
  // })
  
  // GET /ops/heartbeat
  ops.get('/heartbeat', function(){
    return { text: 'hi' } //ops.helpers().message() }
  })
  
  // GET /ops/version
  ops.get('/version', function(){
    return {
      template: 'index',
      print_date: function () {
        return (new Date()).toDateString();
      },
      current_user: {
        name: "Jean-Luc Picard",
        bio: "Captain of the USS Enterprise"
      }
    }
  })
  
})