require('./picard/request_extensions')
require('./picard/routing_engine')
require('./picard/mime_types')
require('./picard/utils')

// function extend(a,b){
//   var props = Object.keys(b)
//   for (i = 0, l = props.length; i < l; i += 1) 
//     a[props[i]] = b[props[i]]
//   return a
// }

Picard.merge({
  start: function() {
    require('http').createServer(function(request, response) {
      Picard.merge(request, Picard.request_extensions)
      request.response = response
      request.addListener('data', request._extract_form_params)
      request.addListener('end', function(){
        request._parse_cookies()
        request._resolve()
      })
    }).listen(Picard.env.port)
    
    require('sys').
      puts('Starting in ' + Picard.env.mode + ' mode.\n' +
           'Picard boldly goes on port ' + Picard.env.port + '...')
  }
})