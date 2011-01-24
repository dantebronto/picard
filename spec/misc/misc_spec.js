describe('GET', function(){
  
  it('should allow a triplet response', function(){
    testReq('GET', '/returns_triplet', function(status, headers, body){
      expect(status).toEqual(201)
      expect(body).toEqual('this is the response')
      expect(headers['content-type']).toEqual('application/foo')
      expect(headers['custom-header']).toEqual('cool')
      asyncSpecDone()
    })
    asyncSpecWait()
  })
  
  it('should allow a string response', function(){ 
    testReq('GET', '/returns_string', function(status, headers, body){
      expect(status).toEqual(200)
      expect(body).toEqual('this is the response')
      asyncSpecDone()
    })
    asyncSpecWait()
  })
  
  it('should allow route passing', function(){
    testReq('GET', '/passing/to_me', function(status, headers, body){
      expect(status).toEqual(200)
      expect(body).toEqual('passed from previous route')
      asyncSpecDone()
    })
    asyncSpecWait()
  })
  
})

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

describe('custom error and 404 handlers', function(){
  
  it('should allow for custom 500 handlers', function(){
    testReq('GET', '/throws/error', function(status, _, body){
      expect(body).toMatch('<h1> Custom 500 Error! </h1><h3>foo is not defined</h3>')
      expect(status).toEqual(500)
      asyncSpecDone()
    })
    asyncSpecWait()    
  })
  
  it('should allow for custom 404 handlers', function(){
    testReq('GET', '/does/not/exist', function(status, _, body){
      expect(body).toEqual('<h1> Custom 404! </h1>')
      expect(status).toEqual(404)
      asyncSpecDone()
    })
    asyncSpecWait()
  })
  
})