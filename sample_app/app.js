require('./config/env')

get('/', function(){
  return { text: 'Hello Universe' }
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
      [ { command_1: 'Make it so' },
        { command_2: 'You have the bridge, Number One' } ] )
  }
})

get('/redirect', function(){
  return {  headers: { location: '/haml' }, status: 302 }
})

post('/order', function(){
  return { text: 'Tea, Earl Grey, Hot' }
})

// curl -d "foo=bar&baz=bat" http://localhost:9900/with_params
post('/with_params', function(params){
  return { text: '<h1>' + params.foo + ' ' + params.baz + '</h1>' }
})

put('/weapon/:id', function(params){
  return { text: '<p>Phaser with id #' + params.id + ' set to stun</p>' }
})

del('/fire/:number', function(params){
  
  var text = '<p>Borg cube destroyed using ' + params.number + ' photon torpedoes</p>'
  
  if (  Number(params.number) > 12 )
    text = '<h1>Maximum yield, full spread!</h1>'
    
  return { text: text }
})
