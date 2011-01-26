describe('basic before filters', function(){
  
  it('should pass data to the route handler', function(){
    testReq('GET', '/', function(status, _, body){
      expect(status).toEqual(200)
      expect(body).toMatch('Hello, Foo!')
      asyncSpecDone()
    })
    asyncSpecWait()
  })
  
})

describe('advanced before filters', function(){
  
  it('should honor onScreen calls from the before filters', function(){
    testReq('GET', '/snappy_path', function(status, _, body){
      expect(status).toEqual(302)
      expect(body).toMatch('login')
      asyncSpecDone()
    })
    asyncSpecWait()
  })
  
  it('should honor onScreen calls from the before filters', function(){
    testReq('GET', '/snappy_path?session_id=123', function(status, headers, body){
      expect(status).toEqual(200)
      expect(body).toMatch('Hello from the snappy path!')
      asyncSpecDone()
    })
    asyncSpecWait()
  })
  
})
