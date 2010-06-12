var req_ex = require('./picard/request_extensions')
require('./picard/routing_engine')
require('./picard/mime_types')

function extend(a,b){
  var props = Object.keys(b)
  for (i = 0, l = props.length; i < l; i += 1) 
    a[props[i]] = b[props[i]]
  return a
}

picard.start = function() {
  require('http').createServer(function(request, response) {
    extend(request, req_ex.get_extensions())
    request.response = response
    request.addListener('data', request.extract_form_params)
    request.addListener('end', function(){
      request.parse_cookies()
      request.resolve()
    })
  }).listen(Picard.env.port)

  require('sys').
    puts('Starting in ' + Picard.env.mode + ' mode.\n' +
         'Picard boldly goes on port ' + Picard.env.port + '...')
}