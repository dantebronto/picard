var req_ex = require('./picard/request_extensions')
require('./picard/routing_engine')
require('./picard/mime_types')

picard.start = function() {
  require('http').createServer(function(request, response) {
    
    process.mixin(request, req_ex.get_extensions())
    request.response = response
    
    request.addListener('data', request.extract_form_params)
    
    request.addListener('end', function(){
      request.parse_cookies()
      request.resolve()
    })
    
  }).listen(picard.env.port)

  require('sys').
    puts('Starting in ' + picard.env.mode + ' mode.\n' +
         'Picard boldly goes on port ' + picard.env.port + '...')
}