describe('RouteSets', function(){

  it('should allow for path prefixes and helpers from the controller', function(){
    testReq('GET', '/ops/heartbeat', function(status, _, body){
      expect(status).toEqual(200)
      expect(body).toMatch('<h1>App is running</h1>')
      asyncSpecDone()
    })
    asyncSpecWait()
  })

  it("should to override global helpers with a route set's helper", function(){
    testReq('GET', '/ops/version', function(_, _, body){
      expect(body).toMatch('Application Version')
      expect(body).toMatch('v0.3')
      asyncSpecDone()
    })
    asyncSpecWait()
  })

  it('should allow for route sets with no name given', function(){
    testReq('GET', '/anonymous_route_set', function(_, _, body){
      expect(body).toMatch('Application Version')
      asyncSpecDone()
    })
    asyncSpecWait()
  })

  it('should allow helpers with arguments', function(){
    testReq('GET', '/anonymous_route_set', function(_, _, body){
      expect(body).toMatch('Hello')
      expect(body).toMatch('Hello Bob')
      asyncSpecDone()
    })
    asyncSpecWait()
  })

  it('should allow inclusion of helpers functions from other route sets', function(){
    testReq('GET', '/anonymous_route_set', function(_, _, body){
      expect(body).toMatch('lights')
      asyncSpecDone()
    })
    asyncSpecWait()
  })

  it('should allow for the local override of a route set helper', function(){
    testReq('GET', '/anonymous_route_two', function(_, _, body){
      expect(body).toMatch('123')
      asyncSpecDone()
    })
    asyncSpecWait()
  })

  it('should accept a layout parameter for the entire route set', function(){
    testReq('GET', '/ops/version', function(_, _, body){
      expect(body).toMatch('http://www.w3.org/1999/xhtml')
      asyncSpecDone()
    })
    asyncSpecWait()
  })

  it('should allow you to override the route set template for a single route', function(){
    testReq('GET', '/ops/heartbeat', function(_, _, body){
      expect(body).toMatch('this is another layout')
      expect(body).toMatch('for testing')
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
})