require('./config/env')

get('/order', function(){
  return { text: "<h1>Tea, Earl Grey, hot.</h1>", status: 200 } // 200 is default status
})

get('/haml', function(){
  var scope = {
    template: 'index.haml', 
    print_date: function () {
      return (new Date()).toDateString();
    },
    current_user: {
      name: "Jean-Luc Picard",
      bio: "Captain of the USS Enterprise"
    }
  };
  return scope;
})