var sys = require('sys'),
    url = require('url'),
    fs = require('fs'),
    http = require('http'),
    doc = require('./template').template,
    server = require('./server'),
    merge = require('./merge'),
    Routes = require('./routing').routes

var request_extensions = {
  cookie: function(name, val, options){
    if ( val === undefined )
      return this.cookies[name]
    
    options = options || {}
    options.value = val
    options.path = options.path || "/"
    
    this.cookies[name] = options
  },
  handle_exception: function(ex) {
    this.on_screen({ 
      status: 500, 
      body: '<h1> 500 Error </h1>' +
        '<h3>' + ex.message + '</h3>' +
        '<pre>' + ex.stack + '</pre>'
    })    
    sys.puts(ex.stack)
  },
  on_screen: function(scope){    
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
    scope.headers = req._set_cookies.call(req, scope.headers)
    
    if ( scope.status == 500 && !scope.template )
      req.send_data(scope)
    else
      doc.buildAndSend(req, scope)
    
    req.log(scope)
  },
  
  log: function(scope){
    sys.puts((this._method || this.method).toUpperCase() + ' ' + this.parsed_url().pathname + ' ' + scope.status)
  },

  parsed_url: function() {
    if (!('url' in this))
      return;
    var parsed = url.parse(this.url, true);
    this.parsed_url = function() {
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
  send_data: function(scope){
    if( !scope.body ) return
    scope.headers.push([ 'Content-Length', scope.body.length ])
    scope.headers.push([ 'Content-Encoding', scope.encoding ])
    this.response.writeHead(scope.status, scope.headers)
    this.response.write(scope.body, scope.encoding)
    this.response.end()
  },
  //////// private stuff //////////
  
  _extract_form_params: function(chunk){
    try {
      if( chunk == undefined ) { return }
      var chunks = chunk.toString().replace(/\+/g, '%20').split('&')
      
      this.post_body = ('post_body' in this) ? this.post_body + chunk : chunk;
      
      for(var i in chunks){
        var k_v = chunks[i].toString().split('=')
        this[k_v[0]] = decodeURIComponent(k_v[1])
      }
    } catch(ex) {
      this.handle_exception(ex)
    }
  },
  _extract_route_params: function(route, match_data){
    var i, l
    
    if( match_data == null ){ return } else { match_data.shift() }
    this.captures = []
    
    for(i=0, l = route.keys.length; i < l; i++)
      this[route.keys[i]] = match_data.shift()
    
    for(i=0, l = match_data.length; i < l; i++)
      this.captures[i] = match_data[i]
  },
  _log_params: function(){
    if( this.post_body )
      sys.puts('  post_body: ' + this.post_body.toString())
    
    for( var prop in this ){
      var skips = [ 'socket','connection','httpVersion','headers','url','cookie','method','statusCode','client','httpVersionMajor',
      'httpVersionMinor','upgrade','handle_exception','on_screen','parsed_url','redirect','send_data','serve_static','response',
      '_events','captures','route','constructor','_parseQueryString','setBodyEncoding','setEncoding','pause','resume','_addHeaderLine',
      'emit','addListener','removeListener','removeAllListeners','listeners', 'cookies', '_method', 'post_body' ]
      
      if ( skips.indexOf(prop) == -1 ) 
        sys.puts('  ' + prop + ': ' + sys.inspect(this[prop]))
    }
  },
  _parse_cookies: function(){
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
      this.handle_exception(ex)
    }
  },
  _resolve: function(){
    try {
      var scope = Routes.executeCallback(this)

      if( scope == 'static' )
        scope = doc.serveStatic(this)
      if ( scope == null )
        return
      
      this.on_screen(scope)
    } catch(ex) {
      this.handle_exception(ex)
    }

  },
  _set_cookies: function(headers){
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
merge(http.IncomingMessage.prototype, request_extensions)