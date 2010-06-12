route_set('test', function(){
  
  // this.helpers({
  //   greet: function(){ return 'Why hello there' }
  // })
  
  this.get('/', function(){
    return { text: 'Hello Universe' }
  })
  
  this.get('/haml', function(){
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