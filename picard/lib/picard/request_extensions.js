var sys = require('sys')
var posix = require('posix')
var haml = require('./haml')

var request_extensions = {
  
  extract_form_params: function(chunk){
    if( chunk == undefined ) { return }
    var chunks = chunk.split('&')
    for(var i in chunks){
      var k_v = chunks[i].split('=')
      this[k_v[0]] = k_v[1]
    }
  },
  
  extract_route_params: function(route, match_data){
    if( match_data == null ){ return } else { match_data.shift() }
    this.captures = []
    
    for(var i=0; i < route.keys.length; i++){
      this[route.keys[i]] = match_data[i]
      match_data.splice(i,1)
    }
    
    for(var i=0; i < match_data.length; i++)
      this.captures[i] = match_data[i]
  },
  
  resolve: function(){
    var scope = picard.routes.execute_callback(this)
    
    if( scope == 'static' )
      scope = this.serve_static()
    if ( scope == null )
      return

    this.on_screen(scope) 
  },
  
  serve_static: function(){
    var request = this
    var filename = picard.env.root + picard.env.public + this.uri.path
    
    // non-blocking static file access
    posix.cat(filename).addCallback(function(content){
      request.on_screen({ 
        body: content, 
        type: picard.mime.lookup_extension(filename.match(/.[^.]*$/)[0]) 
      })
    }).addErrback(function(){
      request.on_screen(null) 
    })
  },
  
  send_data: function(status, headers, body){
    this.response.sendHeader(status, headers)
    this.response.sendBody(body)
    this.response.finish()
  },
  
  on_screen: function(scope){
    if( this.response.finished ){ return }
    
    if ( scope == null )
      scope = { status: 404, body: "<h1> 404 Not Found </h1>" }
    
    var req = this
    var status = scope.status || 200
    var headers = scope.headers || []
    var body = scope.text || scope.body || ''
    
    if(typeof(scope) == 'string')
      body = scope
    
    headers.push([ 'Server', 'Picard v0.1 "Prime Directive"' ])
    headers.push([ 'Content-Type', scope.type || 'text/html' ])
    headers = req.set_cookies(headers)
    
    if(scope.template){
      var template_path = picard.env.root + picard.env.views + '/' + scope.template
      haml.render(scope, template_path, function(body){
        headers.push([ 'Content-Length', body.length ])
        req.send_data(status, headers, body)
      })
    } else {
      headers.push([ 'Content-Length', body.length ])
      req.send_data(status, headers, body)
    }
    
    sys.puts((this._method || this.method).toUpperCase() + ' ' + this.uri.path + ' ' + status)
    
    if(picard.env.mode == 'development')
      sys.puts(sys.inspect(this) + '\n') // request params logging
  },
  
  handle_exception: function(ex) {
    this.on_screen({ 
      status: 500, 
      body: '<h1> 500 Error </h1>' +
        '<h3>' + ex.message + '</h3>' +
        '<pre>' + ex.stack + '</pre>'
    })    
    sys.puts('\n' + ex.message + '\n' + ex.stack)
  },
  
  cookie: function(name, val, options){
    if ( val === undefined )
      return this.cookies[name]
    
    options = options || {}
    options.value = val
    options.path = options.path || "/"
    
    this.cookies[name] = options
  },
  
  set_cookies: function(headers){
    var ret, name, options
    
    for (name in this.cookies) {
      if( this.cookies[name].preset ){ continue }
      options = this.cookies[name]
      ret = name + '=' + options.value
      
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
  },
  
  parse_cookies: function(){
    this.cookies = {}
    var self = this
    var cookieHeader = self.headers["cookie"]
    
    if (cookieHeader){
      cookieHeader.split(";").forEach(function(cookie){
        var parts = cookie.split("=")
        self.cookie(parts[0].trim(), parts[1].trim(), { preset: true })
      })    
    }
  },
  
  redirect: function(location){
    return {  
      status: 302,
      headers: [[ 'Location', location ]], 
      body: '<a href="'+ location + '">' + location + '</a>' 
    }
  }
  
}

exports.get_extensions = function(){ return request_extensions }