var Picard = require('../../lib/picard').

// Many top-level functions return 'this', allowing
// for chaining of routes without calling Picard.globalize()

post('/with_params', function(params){
  return { text: '<h1>' + params.foo + ' ' + params.baz + '</h1>' }
}).

put('/weapon/:id', function(params){
  return { text: '<p>Phaser with id #' + params.id + ' set to stun</p>' }
}).

del('/fire/:number', function(params){  
  var text = '<p>Borg cube destroyed using ' + params.number + ' photon torpedoes</p>'
  
  if (  Number(params.number) > 12 )
    text = '<h1>Maximum yield, full spread!</h1>'
    
  return { text: text }
})