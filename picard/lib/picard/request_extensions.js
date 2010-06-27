var sys = require('sys')
var url = require('url')
var fs = require('fs')
var haml = require('./haml')

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
    
    scope.headers.push([ 'Server', Picard.env.server || 'Picard ' + Picard.version ])
    scope.headers.push([ 'Content-Type', scope.type  || 'text/html' ])
    scope.headers = locals._set_cookies.call(req, scope.headers)
    
    if ( scope.status == 500 )
      req.send_data(scope)
    else
      locals._build_document.call(req, scope)
    
    sys.puts((this._method || this.method).toUpperCase() + ' ' + this.parsed_url().pathname + ' ' + scope.status)
    
    if( Picard.env.mode == 'development' ) 
      locals._log_params.call(req)
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
    this.response.writeHeader(scope.status, scope.headers)
    this.response.write(scope.body, scope.encoding)
    this.response.end()
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
  }
}

// private/protected, does not need to be merged into request_extensions

var template_cache = {}

var locals = {
  _build_document: function(scope){
    var req = this
    scope = locals._extend_scope.call(req, scope)
    
    locals._render_template.call(req, scope, function(){
      locals._render_layout.call(req, scope, function(){
        req.send_data(scope)
      })
    })
  },
  _cached_template: function(request, filename, callback){
    if ( template_cache[filename] )
      callback(template_cache[filename])
    else
      fs.readFile(filename, function(err, body){
        if ( err ){
          if( err.message) err.message += " " + filename
          request_extensions.handle_exception.call(request, err)
          return // something went wrong when reading file
        }
        template_cache[filename] = haml(body.toString())
        callback(template_cache[filename])
      })
  },
  _extend_scope: function(scope){
    var shared_helpers = helpers()

    if ( this.route && this.route.route_set ){
      // merge route set helpers into view scope
      var merged_helpers = Picard.merge({}, shared_helpers, this.route.route_set.helpers())
      scope = Picard.merge({}, merged_helpers, scope)
      
      // use route_set layout if none defined on this scope
      if ( typeof scope.layout == 'undefined' && this.route.route_set.layout )
        scope.layout = this.route.route_set.layout
      
    } else if ( Object.keys(shared_helpers) != 0 ) {
      scope = Picard.merge({}, shared_helpers, scope)
    }
    return scope
  },
  _extract_form_params: function(chunk){
    try {
      if( chunk == undefined ) { return }
      var chunks = chunk.toString().replace(/\+/g, '%20').split('&')
      
      this.post_body = ('post_body' in this) ? this.post_body + chunk : chunk;
      
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
  _render_layout: function(scope, callback){
    if ( typeof scope.layout != 'string' ){
      callback()
      return
    }
    var req = this
    var basepath = Picard.env.root + Picard.env.views + '/'
    var filename = basepath + scope.layout + '.haml'
    
    locals._cached_template(req, filename, function(template){
      var layout_content = locals._safe_render.call(req, template, scope)
      var yield = layout_content.match(/\=\=yield\(\)/)
      if ( yield ) scope.body = layout_content.replace(yield, scope.body)
      callback()
    })
  },
  _render_partial: function(name, scope, partial_scope){
    var filename = Picard.env.root + Picard.env.views + '/' + name + '.haml'
    var body
    if ( typeof template_cache[filename] == 'undefined' ) {
      body = fs.readFileSync(filename)
      template_cache[filename] = haml(body.toString())
    }
    
    var render_scope = scope
    if( partial_scope ) render_scope = Picard.merge({}, scope, partial_scope)
    body = locals._safe_render.call(this, template_cache[filename], render_scope)
    return body
  },
  _render_template: function(scope, callback){
    if ( typeof scope.template != 'string' ) {
      callback()
      return
    }
    
    var req = this
    var basepath = Picard.env.root + Picard.env.views + '/'
    var filename = basepath + scope.template + '.haml'
    
    locals._cached_template(req, filename, function(template){
      scope.body = locals._safe_render.call(req, template, scope)
      callback()
    })
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
  _safe_render: function(template, scope){
    var ret_val
    try{ 
      Picard.merge(scope, {
        partial: function(name, partial_scope){ return locals._render_partial(name, scope, partial_scope) },
        yield: function(name){ return "==yield()" }
      })
      ret_val = template(scope)
    } 
    catch(ex){ this.handle_exception(ex) }
    return ret_val
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

Picard = picard = exports
Picard.request_extensions = request_extensions
Picard.internal_request_functions = locals