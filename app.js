require('./config/env')

get('/order', function(){
  return { text: "<h1>Tea, Earl Grey, hot.</h1>" }
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

get('/json', function(){
  return {
    type: 'application/json',
    body: JSON.stringify(
      [ 
        { command_1: 'make it so' },
        { command_2: 'you have the bridge'}
      ]
    )
  }
})

get('/name/:firstname/:lastname/?', function(firstname, lastname){
  return { text: "<h1>Hello " + firstname + " " + lastname + "</h1>" }
})

get('/', function(){
  return { text: 'hello world', status: 200 } // 200 is the default status
})