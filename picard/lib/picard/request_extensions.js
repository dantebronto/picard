var sys = require('sys')
var url = require('url')
var fs = require('fs')
var haml = require('./haml')

var request_extensions = {

  extract_form_params: function(chunk){
    if( chunk == undefined ) { return }
    var chunks = chunk.replace(/\+/g, '%20').split('&')
    for(var i in chunks){
      var k_v = chunks[i].split('=')
      this[k_v[0]] = decodeURIComponent(k_v[1])
    }
  },
  
  extract_route_params: function(route, match_data){
    var i, l
    
    if( match_data == null ){ return } else { match_data.shift() }
    this.captures = []
    
    for(i=0, l = route.keys.length; i < l; i++)
      this[route.keys[i]] = match_data.shift()
    
    for(i=0, l = match_data.length; i < l; i++)
      this.captures[i] = match_data[i]
  },

  parsed_url: function() {
    // Can't write a getter, because node's process.mixin doesn't support them.
    if (!('url' in this))
      return;
    var parsed = url.parse(this.url);
    this.parsed_url = function() {
      return parsed;
    };
    return parsed;
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
    var filename = file || picard.env.root + picard.env.public_dir + this.parsed_url().pathname

    // non-blocking static file access
    fs.readFile(filename, "binary", function(err, content){
      if ( err ) request.on_screen(null)
      
      request.on_screen({ 
        body: content, 
        type: picard.mime.lookup_extension(filename.match(/.[^.]*$/)[0]),
        encoding: 'binary'
      })
    })
    
  },
  
  send_data: function(scope){
    scope.headers.push([ 'Content-Length', scope.body.length ])
    scope.headers.push([ 'Content-Encoding', scope.encoding ])
    this.response.writeHeader(scope.status, scope.headers)
    this.response.write(scope.body, scope.encoding)
    this.response.close()
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
    
    scope.headers.push([ 'Server', picard.env.server || 'Picard v0.1 "Prime Directive"' ])
    scope.headers.push([ 'Content-Type', scope.type  || 'text/html' ])
    scope.headers = req.set_cookies(scope.headers)

    req.build_document(scope)
    
    sys.puts((this._method || this.method).toUpperCase() + ' ' + this.parsed_url().pathname + ' ' + scope.status)
    
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
  },
  
  parse_cookies: function(){
    this.cookies = {}
    var self = this
    var cookieHeader = self.headers["cookie"]
    
    if (cookieHeader){
      cookieHeader.split("; ").forEach(function(cookie){
        var parts = cookie.split("=")
        self.cookie(parts[0], decodeURIComponent(parts[1]), { preset: true })
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
    var filename
    
    if ( partial && partial[1] ){ // template w/ partial
      filename = basepath + partial[1] + '.haml'
      fs.readFile(filename).addCallback(function(body){
        var partial_content = haml.render(scope, body)
        scope.body = scope.body.replace(partial[0], partial_content)
        req.build_document(scope)
      })
    } else if ( scope.template ) { // first run w/ template
      filename = basepath + scope.template + '.haml'
      
      fs.readFile(filename, function(err, body){
        scope.body = haml.render(scope, body)
        delete scope.template
        req.build_document(scope)
      })
    } else if ( scope.layout ){ // layout first pass, after template + partials
      filename = basepath + scope.layout + '.haml'
      fs.readFile(filename).addCallback(function(layout){
        var layout_content = haml.render(scope, layout)
        var yield = layout_content.match(/\=\=yield\(\)/)      
        if( yield )
          scope.body = layout_content.replace(yield, scope.body)
        delete scope.layout
        req.build_document(scope)
      })
    } else { // document done
      req.send_data(scope)
    }
  }
  
}

exports.get_extensions = function(){ return request_extensions }
