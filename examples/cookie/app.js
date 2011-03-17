require('../../lib/picard').

get('/cookie', function(request){
  
  // a simple key-value cookie
  request.cookie('hobby', 'literature')

  // cookie with all options
  var expires=new Date()
  expires.setDate(expires.getDate() + 30)

  request.cookie('user', 'LCDR Data', { 
    domain: '.your_domain.org', 
    path: '/cookie', 
    expires: expires, 
    secure: true,
    httpOnly: true
  })

  return { // will render 'literature'
    text: '<h1>' + request.cookie('hobby').value + '</h1>' 
  }
  
}).start()