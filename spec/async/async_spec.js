describe('async', function(){
  
  it('should do an async GET in the callback', function(){
    testReq('GET', '/async', function(status, _, body){
      expect(status).toMatch(200)
      expect(body).toMatch('http service call')
      asyncSpecDone()
    })
    asyncSpecWait()
  })

})