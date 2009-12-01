var sys = require('sys')

picard = exports;
picard.routes = require('./picard/engine')

picard.start = function() {
  require('http').createServer(function(request, response) {
    picard.routes.engage(request, response)
  }).listen(picard.env.port)

  sys.puts('Starting in ' + picard.env.mode + ' mode.')
  sys.puts('Picard boldly goes on port ' + picard.env.port + '...')
}