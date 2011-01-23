describe('alternate templating engines', function(){
  
  it('should allow rendering layouts', function(){
    testReq('GET', '/alternate_template', function(_, _, body){
      expect(body).toMatch('<h1>This is the layout!</h1>')
      asyncSpecDone()
    })
    asyncSpecWait()
  })
  
  it('should allow normal view scope merging', function(){
    testReq('GET', '/alternate_template', function(_, _, body){
      expect(body).toMatch('<p>Hello: Jean-Luc Picard</p>')
      asyncSpecDone()
    })
    asyncSpecWait()
  })
  
  it('should allow partials with scope', function(){
    testReq('GET', '/alternate_template', function(_, _, body){
      expect(body).toMatch("This is partial content, Cap'n")
      asyncSpecDone()
    })
    asyncSpecWait()
  })
  
  it('should allow functions from underscore', function(){
    testReq('GET', '/alternate_template', function(_, _, body){
      expect(body).toMatch("Riker")
      expect(body).toMatch("Crusher")
      expect(body).toMatch("Data")
      asyncSpecDone()
    })
    asyncSpecWait()
  })
  
})