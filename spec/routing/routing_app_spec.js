describe('Various routing tests', function(){
  it('should allow regular expressions', function(){
    testReq('GET', '/regex/this/that', function(status, _, body){
      expect(body).toMatch('this that')
      expect(status).toEqual(200)
      asyncSpecDone()
    })
    asyncSpecWait()
  })
  
  it('should sometimes match routes with seletive regular expressions', function(){
    testReq('GET', '/selective/555', function(status, _, body){
      expect(body).toEqual('555')
      expect(status).toEqual(200)
      asyncSpecDone()
    })
    asyncSpecWait()
  })
  
  it('should also not match routes with seletive regular expressions', function(){
    testReq('GET', '/selective/ZZZ', function(status, _, _){
      expect(status).toEqual(404)
      asyncSpecDone()
    })
    asyncSpecWait()
  })
  
  it('should allow regular expressions', function(){
    testReq('GET', '/get_with_params?foo=bar&baz=bat', function(_, _, body){
      expect(body).toMatch('bar bat')
      asyncSpecDone()
    })
    asyncSpecWait()
  })
})