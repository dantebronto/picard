var Picard = require('../../lib/picard')

// Break common.js standards and copy 
// functions from Picard into global namespace.
// Functions from routing.js include 
// REST verbs, helpers, and routeSet
Picard.globalize()

get('/', function(){
  return { text: 'Hello Universe' }
})

post('/order', function(){
  return { text: 'Tea, Earl Grey, Hot' }
})

get('/haml', function(){
  return {
    template: 'index',
    printDate: function () {
      return (new Date()).toDateString();
    },
    currentUser: {
      name: "Jean-Luc Picard",
      bio: "Captain of the USS Enterprise"
    }
  }
})

var commands = [ 
  { command: 'Make it so' }, 
  { command: 'You have the bridge, Number One' } 
]

get('/json', function(){
  return {
    type: 'application/json',
    body: JSON.stringify(commands)
  }
})

get('/redirect/?', function(request){
  request.redirect('/haml')
})

Picard.start()