describe('cookies', function(){
  it('should read from a set cookie', function(){
    testReq('GET', '/cookie', function(_, headers, body){
      expect(headers['set-cookie']).toMatch('hobby=literature')
      expect(body).toMatch('<h1>literature</h1>')
      asyncSpecDone()
    })
    asyncSpecWait()
  })
  
  it('should set two cookies', function(){
    testReq('GET', '/cookie', function(_, headers, _){
      expect(headers['set-cookie']).toMatch('hobby=literature')
      expect(headers['set-cookie']).toMatch('user=LCDR%20Data')
      asyncSpecDone()
    })
    asyncSpecWait()
  })
})