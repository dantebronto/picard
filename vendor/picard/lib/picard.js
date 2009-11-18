var sys = require('sys')

picard = exports;
picard.routes = require('./picard/routes')

picard.start = function() {
  require('http').createServer(function(request, response) {
    try {
      picard.routes.engage(request, response)
    } catch(ex) {
      picard.handle_exception(ex, response)
    }
  }).listen(picard.env.port)

  sys.puts('Starting in ' + picard.env.mode + ' mode.')
  sys.puts('Picard boldly goes on port ' + picard.env.port + '...')
}

picard.handle_exception = function(ex, response) {
  sys.puts(ex.message)
  sys.puts(ex.stack)

  var body = ''
  body = '<h3>' + ex.message + '</h3>'
  body += '<pre>' + ex.stack + '</pre>'

  response.sendHeader(200, {"Content-Type": "text/html"});
  response.sendBody(body);
  response.finish();
}