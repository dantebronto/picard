describe('can use coffeescript', function(){

  it('should allow routes written in coffeescript', function(){
    testReq('GET', '/', function(status, _, body){
      expect(status).toEqual(200)
      expect(body).toMatch('Wicked short route')
      asyncSpecDone()
    })
    asyncSpecWait()
  })
  
  it('should allow at least more than one route', function(){
    testReq('GET', '/redirect', function(status, _, body){
      expect(status).toEqual(302)
      asyncSpecDone()
    })
    asyncSpecWait()
  })
          
})