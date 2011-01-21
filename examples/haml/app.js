require('../../lib/picard').globalize().start()

// call "helpers" to merge functions into the view scope
helpers({
  message: function(){
    return "Welcome to Picard!"
  },
  parity: function(num){
    return num + (num % 2 == 0 ? " is even" : " is odd")
  }
})

var commands = [ 
  { command: 'Make it so' }, 
  { command: 'You have the bridge, Number One' } 
]

// check the views on this one
get('/partial', function(){
  return { 
    template: 'partial_test', 
    layout: 'application',
    commands: commands
  }
})

get('/advanced_haml', function(){
  return { 
    template: 'advanced',
    commands: commands // defined above
  }
})

get('/status/:status', function(env){
  env.onScreen({ // render a template
    status: Number(env.status), 
    template: 'advanced',
    commands: commands
  })
})