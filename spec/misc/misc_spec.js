describe('POST', function(){  
  
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

describe('error handling', function(){
    
  it('should allow template rendering if the status is 500', function(){
    testReq('GET', '/status/500', function(status, headers, body){
      expect(status).toEqual(500) 
      expect(body).toMatch('is even')
      asyncSpecDone()
    })
    asyncSpecWait()
  })
  
})