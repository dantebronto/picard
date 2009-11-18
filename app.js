require('./config/env')

get('/replicate', function(){
  return { text: "<h1>Tea, Earl Grey, hot!</h1>", status: 200 } // 200 is default status
})

get('/haml', function(){
  
})


