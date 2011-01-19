describe('GET', function(){
  
  it('should follow redirects', function(){
    testReq('GET', '/redirect', function(status, headers, body){
      // rfc2616 10.3.3 Unless the request method was HEAD, the entity of the response
      // SHOULD contain a short hypertext note with a hyperlink to the new URI(s).
      expect(body).toMatch('<a href="/haml">/haml</a>')
      expect(status).toEqual(302)
      expect(headers.location).toEqual('/haml')
      asyncSpecDone()
    })
    asyncSpecWait()
  })


})

describe('POST', function(){
  it('should do normal post', function(){
    testReq('POST', '/order', function(status, _, body){
      expect(body).toEqual('Tea, Earl Grey, Hot')
      expect(status).toEqual(200)
      asyncSpecDone()
    })
    asyncSpecWait()
  })
  
  it('should accept parameters', function(){
    testReq('POST', '/with_params', 'foo=bar&baz=bat', function(status, _, body){
      expect(body).toEqual('<h1>bar bat</h1>')
      expect(status).toEqual(200)
      asyncSpecDone()
    })
    asyncSpecWait()
  })
})

describe('PUT', function(){
  it('should accept parameters', function(){
    testReq('POST', '/weapon/3', '_method=put', function(status, _, body){
      expect(body).toEqual('<p>Phaser with id #3 set to stun</p>')
      expect(status).toEqual(200)
      asyncSpecDone()
    })
    asyncSpecWait()
  })
  
  it('should accept real PUTs', function(){
    testReq('PUT', '/weapon/5', function(status, _, body){
      expect(body).toEqual('<p>Phaser with id #5 set to stun</p>')
      expect(status).toEqual(200)
      asyncSpecDone()
    })
    asyncSpecWait()
  })
})

describe('DELETE', function(){
  it('should accept parameters', function(){
    testReq('POST', '/fire/3', '_method=delete', function(status, _, body){
      expect(body).toEqual('<p>Borg cube destroyed using 3 photon torpedoes</p>')
      expect(status).toEqual(200)
      asyncSpecDone()
    })
    asyncSpecWait()
  })
  
  it('should execute any logic in the callback', function(){
    testReq('DELETE', '/fire/15', function(status, _, body){
      expect(body).toEqual('<h1>Maximum yield, full spread!</h1>')
      expect(status).toEqual(200)
      asyncSpecDone()
    })
    asyncSpecWait()
  })
})

describe('static assets', function(){
  it('should serve html', function(){
    testReq('GET', '/index.html', function(status, headers, body){
      expect(status).toEqual(200)
      expect(headers['content-type']).toEqual('text/html')
      expect(body).toMatch('<h1>this is static content!</h1>')
      asyncSpecDone()
    })
    asyncSpecWait()
  })
  
  it('should serve css', function(){
    testReq('GET', '/style.css', function(status, headers, body){
      expect(status).toEqual(200)
      expect(headers['content-type']).toEqual('text/css')
      expect(body).toMatch('background-color')
      asyncSpecDone()
    })
    asyncSpecWait()
  })
  
  it('should serve js', function(){
    testReq('GET', '/static.js', function(status, headers, body){
      expect(status).toEqual(200)
      expect(headers['content-type']).toEqual('application/javascript')
      expect(body).toMatch('alert')
      asyncSpecDone()
    })
    asyncSpecWait()
  })

  it('should serve images', function(){
    testReq('GET', '/picard.jpg', function(status, headers, body){
      expect(status).toEqual(200)
      expect(headers['content-type']).toEqual('image/jpeg')      
      expect(body).toMatch('CREATOR: gd-jpeg v1.0')
      asyncSpecDone()
    })
    asyncSpecWait()
  })
})

describe('globbing', function(){
  it('should slurp the remainder of the url', function(){
    testReq('GET', '/foo/bar/Ive/Been/Slurped', function(_, _, body){
      expect(body).toMatch("Globbed params for 'baz': Ive/Been/Slurped")
      asyncSpecDone()
    })
    asyncSpecWait()
  })
})

describe('general', function(){
  it('should do an async GET in the callback', function(){
    testReq('GET', '/async_example', function(status, _, body){
      expect(status).toMatch(200)
      expect(body).toMatch('<div id="name">Name: Jean-Luc Picard</div>')
      asyncSpecDone()
    })
    asyncSpecWait()
  })
  
  it('should 404 on missing static content', function(){
    testReq('GET', '/i_dont_exist.html', function(status, _, body){
      expect(status).toMatch(404)
      expect(body).toMatch('404')
      asyncSpecDone()
    })
    asyncSpecWait()
  })
  
  it('should allow multple URL params', function(){
    testReq('GET', '/multiple/bar/baz', function(_, _, body){
      expect(body).toEqual('bar baz')
      asyncSpecDone()
    })
    asyncSpecWait()
  })
})

describe('cookies', function(){
  it('should read from a set cookie', function(){
    testReq('GET', '/cookie', function(_, headers, body){
      expect(headers['set-cookie']).toMatch('hobby=literature')
      expect(body).toMatch('<h1>literature</h1>')
      asyncSpecDone()
    })
    asyncSpecWait()
  })
  
  it('should set two cookies', function(){
    testReq('GET', '/cookie', function(_, headers, _){
      expect(headers['set-cookie']).toMatch('hobby=literature')
      expect(headers['set-cookie']).toMatch('user=LCDR%20Data')
      asyncSpecDone()
    })
    asyncSpecWait()
  })
})

describe('advanced haml', function(){
  it('should allow for the "if" plugin', function(){
    testReq('GET', '/advanced_haml', function(_, _, body){
      expect(body).toMatch('This will show up!')
      expect(body).toNotMatch('This will not show up!')
      asyncSpecDone()
    })
    asyncSpecWait()
  })
  
  it('should allow for the "foreach" plugin', function(){
    testReq('GET', '/advanced_haml', function(_, _, body){
      expect(body).toMatch('<li>Make it so</li>')
      expect(body).toMatch('<li>You have the bridge, Number One</li>')
      asyncSpecDone()
    })
    asyncSpecWait()
  })
  
  it('should merge global helpers into the template scope', function(){
    testReq('GET', '/advanced_haml', function(_, _, body){
      expect(body).toMatch('Welcome to Picard')
      expect(body).toMatch('3 is odd')
      expect(body).toMatch('4 is even')
      asyncSpecDone()
    })
    asyncSpecWait()
  })  
})

describe('partials and layouts', function(){
  it('should render layout, template, partial, and sub partial', function(){
    testReq('GET', '/partial', function(_, _, body){
      expect(body).toMatch('DOCTYPE') // layout
      expect(body).toMatch('This is "partial_test.haml" content') // template
      expect(body).toMatch('This is "snippet.haml" content') // partial
      expect(body).toMatch('This is "sub_partial.haml" content') // partial
      asyncSpecDone()
    })
    asyncSpecWait()
  })

  it('should partials in a loop', function(){
    testReq('GET', '/partial', function(_, _, body){
      expect(body).toMatch('<li>Make it so</li>')
      expect(body).toMatch('<li>You have the bridge, Number One</li>')
      asyncSpecDone()
    })
    asyncSpecWait()
  })
})

describe('error handling', function(){
  it('should catch a 500 error if an error occurs during template rendering', function(){
    testReq('GET', '/anonymous_fail_route', function(status, _, body){
      expect(body).toMatch('foo is not defined')
      asyncSpecDone()
    })
    asyncSpecWait()
  })
  
  it('should allow template rendering if the status is 500', function(){
    testReq('GET', '/status/500', function(status, headers, body){
      expect(status).toEqual(500) 
      expect(body).toMatch('is even')
      asyncSpecDone()
    })
    asyncSpecWait()
  })
})