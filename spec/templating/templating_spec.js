describe('alternate templating engines', function(){
  
  it('should allow rendering layouts, partials, and scope merging', function(){
    testReq('GET', '/underscore_templates', function(_, _, body){
      expect(body).toMatch('<h1>This is the layout!</h1>')
      expect(body).toMatch('<p>Hello: Jean-Luc Picard</p>')
      expect(body).toMatch("This is partial content, Cap'n")
      expect(body).toMatch("Riker")
      expect(body).toMatch("Crusher")
      expect(body).toMatch("Data")
      asyncSpecDone()
    })
    asyncSpecWait()
  })
      
})