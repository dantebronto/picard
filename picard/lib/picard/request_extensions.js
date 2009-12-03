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
    var scope = null
    
    scope = picard.routes.execute_callback(this)

    if( scope == 'static' )
      scope = this.serve_static()
    else if ( scope == null || scope == 'async' )
      return
      
    this.on_screen(scope) 
  },
  
  serve_static: function(){
    try { // TODO: better way to do this?
      var filename = picard.env.root + picard.env.public + this.uri.path
      var scope = { 
        body: posix.cat(filename).wait(),
        type: picard.mime.lookup_extension(filename.match(/.[^.]*$/)[0])
      }
    } catch(e) {
      scope = null
    }
    
    return scope
  },
      
  on_screen: function(scope){
    var res = this.response
    
    if ( scope == null )
      scope = { status: 404, body: "<h1> 404 Not Found </h1>" }
      
    var body = scope.text || scope.body || ''
    var headers = scope.headers || {}
    var status = scope.status || 200
    
    if(typeof(scope) == 'string')
      body = scope
  
    headers['Content-Type'] = scope.type || "text/html"
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
      
    if ( status != 404 ) // show params
      sys.puts('\n' + (this._method || this.method).toUpperCase() + ' ' + 
      this.uri.path + ' ' + status + '\n' + sys.inspect(this))
  },
  
  handle_exception: function(ex) {
    this.on_screen({ 
      status: 500, 
      body: '<h1> 500 Error </h1>' +
        '<h3>' + ex.message + '</h3>' +
        '<pre>' + ex.stack + '</pre>' 
    })    
    sys.puts('\n' + ex.message + '\n' + ex.stack)
  }
  
}

exports.get_extensions = function(){ return request_extensions }