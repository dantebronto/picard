var http = require('http')

var Server = {
  start: function() {
    Server.setVersion.call(this)
    
    this.httpServer = http.createServer(function(request, response) {
      request.response = response
      
      if ( request.isMultipart() )
        request.pass()
      else
        request
          .on('data', request.extractFormParams)
          .on('end', request.pass)
    })
    this.httpServer.listen(this.env.port)
    
    require('sys').puts('Starting in ' + this.env.mode + ' mode.\n' +
      'Picard boldly goes on port ' + this.env.port + '...')
    
    return this
  },
  error: function(proc){
    http.IncomingMessage.prototype.handleException = proc
    return this
  },
  notFound: function(proc){
    http.IncomingMessage.prototype.handleNotFound = proc
    return this
  },
  version: 'v0.3 "There are... four... lights!"',
  setVersion: function(){
    var version
    
    if ( this.version === null )
      version = null
    else if ( this.version )
      version = this.version
    else 
      version = 'Picard ' + Server.version

    http.IncomingMessage.prototype.picardServer = version
  }
}

exports.start    = Server.start
exports.version  = Server.version
exports.error    = Server.error
exports.notFound = Server.notFound