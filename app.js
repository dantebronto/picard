require('./config/env')

get('/order', function(req){
  return { text: "<h1>Tea, Earl Grey, hot.</h1>" }
})

get('/haml', function(req){
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

get('/json', function(req){
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

get('/name/:first/:last/?', function(req){
  return { text: "<h1>Hello " + req.uri.params.first + " " + req.uri.params.last + "</h1>" }
})

get('^/$', function(req){
  return { text: 'hello world', status: 200 } // 200 is the default status
})

get('/redirect', function(req){
  return {  headers: { location: '/haml' }, status: 302 }
})

