describe('Basic GETs and rendering', function(){
  
  it('should do gets', function(){
    testReq('GET', '/', function(status, _, body){
      expect(body).toEqual('Hello Universe')
      expect(status).toEqual(200)
      asyncSpecDone()
    })
    asyncSpecWait()
  })

  it('should do gets with normal params', function(){
    testReq('GET', '/', function(status, _, body){
      expect(body).toEqual('Hello Universe')
      expect(status).toEqual(200)
      asyncSpecDone()
    })
    asyncSpecWait()
  })

  it('should render a haml template', function(){
    testReq('GET', '/haml', function(status, _, body){
      expect(body).toMatch('<div id="date">')
      expect(body).toMatch('<div id="name">Name: Jean-Luc Picard</div>')
      expect(body).toMatch('<div id="title">Title: Captain of the USS Enterprise</div>')
      expect(status).toEqual(200)
      asyncSpecDone()
    })
    asyncSpecWait()
  })

  it("shouldn't be bothered by trailing slashes", function(){
    testReq('GET', '/haml/', function(status, _, body){
      expect(body).toMatch('<div id="name">Name: Jean-Luc Picard</div>')
      expect(status).toEqual(200)
      asyncSpecDone()
    })
    asyncSpecWait()
  })

  it('should render json', function(){
    testReq('GET', '/json', function(status, headers, body){
      expect(body).toMatch("[{\"command\":\"Make it so\"},{\"command\":\"You have the bridge, Number One\"}]")
      expect(headers['content-type']).toEqual('application/json')
      expect(status).toEqual(200)
      asyncSpecDone()
    })
    asyncSpecWait()
  })
  
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
  
})

describe('HEAD', function(){

  it('should support HEAD', function(){
    testReq('HEAD', '/', function(status, headers, body){
      expect(status).toMatch(200)
      expect(headers['content-length']).toEqual('14')
      expect(body).toMatch('')
      asyncSpecDone()
    })
    asyncSpecWait()
  })

})