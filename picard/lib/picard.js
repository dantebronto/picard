require('./picard/request_extensions')
require('./picard/routing_engine')
require('./picard/mime_types')
require('./picard/utils')

Picard.merge({  
  start: function() {
    var locals = Picard.private_request_functions
    
    require('http').createServer(function(request, response) {
      
      Picard.merge(request, Picard.request_extensions)
      request.response = response
      
      request.addListener('data', function(chunk){ 
        locals._extract_form_params.call(request, chunk)
      })
      
      request.addListener('end', function(){
        locals._parse_cookies.call(request)
        locals._resolve.call(request)
      })
      
    }).listen(Picard.env.port)
    
    require('sys').
      puts('Starting in ' + Picard.env.mode + ' mode.\n' +
           'Picard boldly goes on port ' + Picard.env.port + '...')
  }
})