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
  
})