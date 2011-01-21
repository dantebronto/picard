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
  
  it('should 404 on missing static content', function(){
    testReq('GET', '/i_dont_exist.html', function(status, _, body){
      expect(status).toMatch(404)
      expect(body).toMatch('404')
      asyncSpecDone()
    })
    asyncSpecWait()
  })
  
})