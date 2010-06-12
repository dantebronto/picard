var sys = require('sys')
var url = require('url')
var fs = require('fs')
var haml = require('./haml')

var request_extensions = {
  _build_document: function(scope){
    // res = Picard.extend({}, this.route.route_set.helpers_cache, scope)
    // if ( this.route && this.route.route_set )
    //   
    //   this._extend_scope(scope, this.route.route_set.helpers_cache) // mixin any helpers within a route set
    //this._extend_scope(scope, helpers()) // mixin any global helpers 
    // Picard.extend(scope, helpers())
    // require('sys').puts(require('sys').inspect(scope))
    // kellen = Picard.extend({}, helpers(), scope)
    //     require('sys').puts(require('sys').inspect(kellen))
    //     
    // scope = Picard.extend(scope, helpers())
    
    // try{
    //   var obj = Picard.extend({}, {foo: 'bar'}, {that: 'this'})
    //   require('sys').puts(require('sys').inspect(obj))
    // }
    // catch(ex){ this.handle_exception(ex) }
    
    if ( !scope.body ) this.send_data({}) // 500 caught, end request
    
    var basepath = Picard.env.root + Picard.env.views + '/'
    var partial = scope.body.match(/\=\=partial\('(.*)'\)/)
    var req = this
    var filename
    
    if ( partial && partial[1] ){ // template w/ partial
      filename = basepath + partial[1] + '.haml'
      fs.readFile(filename, function(err, body){
        var partial_content = locals._safe_render.call(req, scope, body)
        scope.body = scope.body.replace(partial[0], partial_content)
        req._build_document(scope)
      })
    } else if ( scope.template ) { // first run w/ template
      filename = basepath + scope.template + '.haml'
      
      fs.readFile(filename, function(err, body){
        scope.body = locals._safe_render.call(req, scope, body)
        delete scope.template
        req._build_document(scope)
      })
    } else if ( scope.layout ){ // layout first pass, after template + partials
      filename = basepath + scope.layout + '.haml'
      fs.readFile(filename, function(err, layout){
        var layout_content = locals._safe_render.call(req, scope, layout)
        var yield = layout_content.match(/\=\=yield\(\)/)      
        if( yield )
          scope.body = layout_content.replace(yield, scope.body)
        delete scope.layout
        req._build_document(scope)
      })
    } else { // document done
      req.send_data(scope)
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
  
  _extract_form_params: function(chunk){
    try {
      if( chunk == undefined ) { return }
      var chunks = chunk.toString().replace(/\+/g, '%20').split('&')
      for(var i in chunks){
        var k_v = chunks[i].split('=')
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
  },
  
  _resolve: function(){
    try {
      var scope = Picard.routes.execute_callback(this)

      if( scope == 'static' )
        scope = this.serve_static()
      if ( scope == null )
        return
      
      this.on_screen(scope)
    } catch(ex) {
      this.handle_exception(ex)
    }

  },
  
  parsed_url: function() {
    if (!('url' in this))
      return;
    var parsed = url.parse(this.url);
    this.parsed_url = function() {
      return parsed;
    };
    return parsed;
  },
  
  serve_static: function(file){
    var request = this
    var name = this.parsed_url().pathname
    var filename = file || Picard.env.root + Picard.env.public_dir + name
    
    if( name == '/' ) // look for index.html if no action defined for '/'
      filename = Picard.env.root + Picard.env.public_dir + '/index.html'
    
    // non-blocking static file access
    fs.readFile(filename, "binary", function(err, content){
      if ( err ) request.on_screen(null)
      
      request.on_screen({ 
        body: content, 
        type: Picard.mime.lookup_extension(filename.match(/.[^.]*$/)[0]),
        encoding: 'binary'
      })
    })
    
  },
  
  send_data: function(scope){
    if( !scope.body ) return
    scope.headers.push([ 'Content-Length', scope.body.length ])
    scope.headers.push([ 'Content-Encoding', scope.encoding ])
    this.response.writeHeader(scope.status, scope.headers)
    this.response.write(scope.body, scope.encoding)
    this.response.end()
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
    
    scope.headers.push([ 'Server', Picard.env.server || 'Picard v0.1 "Prime Directive"' ])
    scope.headers.push([ 'Content-Type', scope.type  || 'text/html' ])
    scope.headers = req._set_cookies(scope.headers)

    req._build_document(scope)

    sys.puts((this._method || this.method).toUpperCase() + ' ' + this.parsed_url().pathname + ' ' + scope.status)
    
    if(Picard.env.mode == 'development')
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
  
  redirect: function(location){
    return {  
      status: 302,
      headers: [[ 'Location', location ]], 
      body: '<a href="'+ location + '">' + location + '</a>' 
    }
  },
  
  _extend_scope: function(scope, extension){
    var props = Object.keys(extension)
    for (i = 0, l = props.length; i < l; i += 1)
      if ( !scope[props[i]] ) scope[props[i]] = extension[props[i]]
    return scope
  }
  
}

// private

var locals = {
  _safe_render: function(scope, body){
    var ret_val
    try{ ret_val = haml.render(scope, body.toString()) } 
    catch(ex){ this.handle_exception(ex) }
    return ret_val
  }
}

//exports.get_extensions = function(){ return request_extensions }
Picard = picard = exports
Picard.request_extensions = request_extensions