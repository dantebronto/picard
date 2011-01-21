var http = require('http')

var Server = {
  start: function() {
    http.IncomingMessage.prototype.picardServer = this.env.server
    
    var server = http.createServer(function(request, response) {
      request.response = response
    
      request
        .on('data', function(chunk){ 
          request.extractFormParams(chunk)
        })
        .on('end', function(){
          request.parseCookies()
          request.resolve()
        })
    })
    
    server.listen(this.env.port)
    
    require('sys').puts('Starting in ' + this.env.mode + ' mode.\n' +
      'Picard boldly goes on port ' + this.env.port + '...')
      
    return this
  },
  version: 'v0.3 "There are... four... lights!"'
}

exports.start   = Server.start
exports.version = Server.version