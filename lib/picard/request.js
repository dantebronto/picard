var sys = require('sys'),
    url = require('url'),
    doc = require('./template').template,
    server = require('./server'),
    merge = require('./merge'),
    Routes = require('./routing')

var requestExtensions = {
  cookie: function(name, val, options){
    if ( val === undefined )
      return this.cookies[name]
    
    options = options || {}
    options.value = val
    options.path = options.path || "/"
    
    this.cookies[name] = options
  },
  handleException: function(ex) {
    this.onScreen({ 
      status: 500, 
      body: '<h1> 500 Error </h1>' +
        '<h3>' + ex.message + '</h3>' +
        '<pre>' + ex.stack + '</pre>'
    })    
    sys.puts(ex.stack)
  },
  onScreen: function(scope){    
    if( this.response.finished ){ return }
    
    if ( scope == null )
      scope = { status: 404, body: "<h1> 404 Not Found </h1>" }
    
    var req = this
    
    if(typeof(scope) == 'string')
      scope = { text: scope }
    
    scope.status   = scope.status   || 200
    scope.headers  = scope.headers  || []
    scope.body     = scope.text     || scope.body || ''
    scope.encoding = scope.encoding || 'utf8'
    
    scope.headers.push([ 'Server', req.picardServer || 'Picard ' + server.version ])
    scope.headers.push([ 'Content-Type', scope.type  || 'text/html' ])
    scope.headers = req.setCookies(scope.headers)
    
    if ( scope.status == 500 && !scope.template )
      req.sendData(scope)
    else
      doc.buildAndSend(req, scope)
    
    req.log(scope)
  },
  log: function(scope){
    sys.puts((this._method || this.method).toUpperCase() + ' ' + this.parsedUrl().pathname + ' ' + scope.status)
  },
  parsedUrl: function() {
    if ( !('url' in this) )
      return;
    var parsed = url.parse(this.url, true);
    this.parsedUrl = function() {
      return parsed;
    };
    return parsed;
  },
  redirect: function(location){
    return {  
      status: 302,
      headers: [[ 'Location', location ]], 
      body: '<a href="'+ location + '">' + location + '</a>' 
    }
  },
  sendData: function(scope){
    if( !scope.body ) return
    scope.headers.push([ 'Content-Length', scope.body.length ])
    scope.headers.push([ 'Content-Encoding', scope.encoding ])
    this.response.writeHead(scope.status, scope.headers)
    this.response.write(scope.body, scope.encoding)
    this.response.end()
  },
  extractFormParams: function(chunk){
    try {
      if( chunk == undefined ) { return }
      var chunks = chunk.toString().replace(/\+/g, '%20').split('&')
      
      this.body = ('body' in this) ? this.body + chunk : chunk;
      
      for(var i in chunks){
        var k_v = chunks[i].toString().split('=')
        this[k_v[0]] = decodeURIComponent(k_v[1])
      }
    } catch(ex) {
      this.handleException(ex)
    }
  },
  extractRouteParams: function(route, match_data){
    var i, l
    
    if( match_data == null ){ return } else { match_data.shift() }
    this.captures = []
    
    for(i=0, l = route.keys.length; i < l; i++)
      this[route.keys[i]] = match_data.shift()
    
    for(i=0, l = match_data.length; i < l; i++)
      this.captures[i] = match_data[i]
  },
  parseCookies: function(){
    try {
      this.cookies = {}
      var self = this
      var cookieHeader = self.headers["cookie"]
      if (cookieHeader){
        
        cookieHeader.split("; ").forEach(function(cookie){
          var parts = cookie.split("=")
          self.cookie(parts[0], decodeURIComponent(parts[1]), { preset: true })
        })
      }
    } catch(ex) {
      this.handleException(ex)
    }
  },
  resolve: function(){
    try {
      var scope = Routes.executeCallback(this)

      if( scope == 'static' )
        scope = doc.serveStatic(this)
      if ( scope == null )
        return
      
      this.onScreen(scope)
    } catch(ex) {
      this.handleException(ex)
    }

  },
  setCookies: function(headers){
    var ret, name, options
    
    for(name in this.cookies) {
      if( this.cookies[name].preset ){ continue }
      options = this.cookies[name]
      ret = name + '=' + encodeURIComponent(options.value)
      
      if (options.expires)
        ret += '; expires=' + options.expires.toUTCString()
      if (options.path)
        ret += '; path=' + options.path
      if (options.domain)
        ret += '; domain=' + options.domain
      if (options.secure)
        ret += '; secure'
      
      headers.push([ "Set-Cookie", ret ])
    }
    return headers
  }
}

// extend abstract parent of http.ServerRequest
merge(require('http').IncomingMessage.prototype, requestExtensions)