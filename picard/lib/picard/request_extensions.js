var sys = require('sys')
var posix = require('posix')
var haml = require('./haml')

var request_extensions = {
  
  extract_form_params: function(chunk){
    if( chunk == undefined ) { return }
    var chunks = decodeURIComponent(chunk).split('&')
    for(var i in chunks){
      var k_v = chunks[i].split('=')
      this[k_v[0]] = k_v[1]
    }
  },
  
  extract_route_params: function(route, match_data){

    if( match_data == null ){ return } else { match_data.shift() }
    this.captures = []
    
    for(var i=0, l = route.keys.length; i < l; i++)
      this[route.keys[i]] = match_data.shift()
    
    for(var i=0, l = match_data.length; i < l; i++)
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
  
  serve_static: function(file){
    var request = this
    var filename = file || picard.env.root + picard.env.public + this.uri.path
    
    // non-blocking static file access
    posix.cat(filename, 'binary').addCallback(function(content){
      request.on_screen({ 
        body: content, 
        type: picard.mime.lookup_extension(filename.match(/.[^.]*$/)[0]),
        encoding: 'binary'
      })
    }).addErrback(function(){
      request.on_screen(null) 
    })
    
  },
  
  send_data: function(scope){
    scope.headers.push([ 'Content-Length', scope.body.length ])
    this.response.sendHeader(scope.status, scope.headers)
    this.response.sendBody(scope.body, scope.encoding)
    this.response.finish()
  },
  
  on_screen: function(scope){
    if( this.response.finished ){ return }
    
    if ( scope == null )
      scope = { status: 404, body: "<h1> 404 Not Found </h1>" }
    
    var req = this
    scope.status = scope.status || 200
    scope.headers = scope.headers || []
    scope.body = scope.text || scope.body || ''
    scope.encoding = scope.encoding || 'ascii'
    
    if(typeof(scope) == 'string')
      body = scope
    
    scope.headers.push([ 'Server', 'Picard v0.1 "Prime Directive"' ])
    scope.headers.push([ 'Content-Type', scope.type || 'text/html' ])
    scope.headers = req.set_cookies(scope.headers)
    
    if(scope.template){
      
      var basepath = picard.env.root + picard.env.views + '/'
      var filename = basepath + scope.template + '.haml'
      
      posix.cat(filename).addCallback(function(body){
        haml.render(scope, body, function(new_body){
          scope.body = new_body
          req.build_document(scope)
        })
      })
      
    } else{
      req.send_data(scope)
    }
    
    sys.puts((this._method || this.method).toUpperCase() + ' ' + this.uri.path + ' ' + scope.status)
    
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
    
    for(name in this.cookies) {
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
  },
  
  build_document: function(scope){
    var basepath = picard.env.root + picard.env.views + '/'
    var partial = scope.body.match(/\=\=partial\('(.*)'\)/)
    var req = this
    
    if ( partial && partial[1] ){
      var path = basepath + '_' + partial[1] + '.haml'
      
      posix.cat(path).addCallback(function(body){
        haml.render(scope, body, function(partial_content){
          scope.body = scope.body.replace(partial[0], partial_content)
          req.build_document(scope)
        })
      })
        
    } else {
      
      if(scope.layout)
        req.layout_yield(scope)
      else
        req.send_data(scope)
    }
  },

  layout_yield: function(scope){    
    var req = this
    
    var basepath = picard.env.root + picard.env.views + '/'
    var filename = basepath + scope.layout + '.haml'

    posix.cat(filename).addCallback(function(layout){        
      haml.render(scope, layout, function(layout_content){
        var yield = layout_content.match(/\=\=yield\(\)/)          
        if( yield )
          scope.body = layout_content.replace(yield, scope.body)
        req.send_data(scope)
      })
    }).addErrback(function(){
      req.send_data(scope)
    })
  }
  
}

exports.get_extensions = function(){ return request_extensions }
