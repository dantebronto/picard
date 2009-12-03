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
    this.parse_cookies()
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
  
    sys.exec("[ -f " + filename + " ] && echo '1' || echo '0'").addCallback(function(stdout){
      if( stdout == 1 ){
        posix.cat(filename).addCallback(function(content){
          request.on_screen({ 
            body: content, 
            type: picard.mime.lookup_extension(filename.match(/.[^.]*$/)[0]) 
          })
        }) 
      } else { 
        request.on_screen(null) 
      }
    });
  },
  
  on_screen: function(scope){
    if( this.response.finished ){ return }
    var res = this.response
    
    if ( scope == null )
      scope = { status: 404, body: "<h1> 404 Not Found </h1>" }
    
    var body = scope.text || scope.body || ''
    var headers = scope.headers || {}
    var status = scope.status || 200
    
    if(typeof(scope) == 'string')
      body = scope
  
    headers['content-type'] = scope.type || "text/html"
    headers = this.format_headers(headers)
    headers = this.set_cookies(headers)
    
    res.sendHeader(status, headers)
    
    if(scope.template){
      var template_path = picard.env.root + picard.env.views + '/' + scope.template
      haml.render(scope, template_path, function(body){
        res.sendBody(body)
        res.finish()
      })
    } else {
      res.sendBody(body)
      res.finish()
    }
    
    sys.puts('\n' + (this._method || this.method).toUpperCase() + ' ' + this.uri.path + ' ' + status)
    
    if(picard.env.mode == 'development')
      sys.puts(sys.inspect(this)) // request params logging
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
      ret = []
      
      ret.push(name, "=", this.cookies[name].value)
      
      options = this.cookies[name]
      
      if (options.expires)
        ret.push("; expires=", options.expires.toUTCString())
      
      if (options.path)
        ret.push("; path=", options.path)
      
      if (options.domain)
        ret.push("; domain=", options.domain)
      
      if (options.secure)
        ret.push("; secure")
      
      headers[headers.length] = [ "Set-Cookie", ret.join("") ]
    }
    return headers
  },
  
  parse_cookies: function(){
    var cookieHeader = this.headers["cookie"]
    var cookies = {};
    
    if (cookieHeader){
      cookieHeader.split(";").forEach(function(cookie){
        var parts = cookie.split("=")
        cookies[ parts[0].trim() ] = parts[1].trim()
      })    
    }
    this.cookies = cookies
  },
  
  format_headers: function(headers){ // make header object an array
    var ara = []
    for( var h in headers ){
      ara[ara.length] = [ h, headers[h] ]
    }
    return ara
  }
  
}

exports.get_extensions = function(){ return request_extensions }