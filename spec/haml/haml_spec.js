describe('advanced haml', function(){
  
  it('should allow for the "if" plugin', function(){
    testReq('GET', '/advanced_haml', function(_, _, body){
      expect(body).toMatch('This will show up!')
      expect(body).toNotMatch('This will not show up!')
      asyncSpecDone()
    })
    asyncSpecWait()
  })
  
  it('should allow for the "foreach" plugin', function(){
    testReq('GET', '/advanced_haml', function(_, _, body){
      expect(body).toMatch('<li>Make it so</li>')
      expect(body).toMatch('<li>You have the bridge, Number One</li>')
      asyncSpecDone()
    })
    asyncSpecWait()
  })
  
  it('should merge global helpers into the template scope', function(){
    testReq('GET', '/advanced_haml', function(_, _, body){
      expect(body).toMatch('Welcome to Picard')
      expect(body).toMatch('3 is odd')
      expect(body).toMatch('4 is even')
      asyncSpecDone()
    })
    asyncSpecWait()
  })  
  
})

describe('partials and layouts', function(){
  
  it('should render layout, template, partial, and sub partial', function(){
    testReq('GET', '/partial', function(_, _, body){
      expect(body).toMatch('DOCTYPE') // layout
      expect(body).toMatch('This is "partial_test.haml" content') // template
      expect(body).toMatch('This is "snippet.haml" content') // partial
      expect(body).toMatch('This is "sub_partial.haml" content') // partial
      asyncSpecDone()
    })
    asyncSpecWait()
  })

  it('should partials in a loop', function(){
    testReq('GET', '/partial', function(_, _, body){
      expect(body).toMatch('<li>Make it so</li>')
      expect(body).toMatch('<li>You have the bridge, Number One</li>')
      asyncSpecDone()
    })
    asyncSpecWait()
  })
  
})
