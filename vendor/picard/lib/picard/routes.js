var sys = require('sys')
var Haml = require('./haml')

var routes = {
  engage: function(request, response){
    
    response.on_screen = function(scope){
      var self = this
      var response = scope.response
      var status = scope.status || 200
      var body = scope.text || scope.body || ''
      var type = scope.type || "text/html"
      var template = scope.template || null
      var headers = scope.headers || {}
      
      if(typeof(scope) == 'string')
        body = scope
      
      headers['Content-Type'] = type
      self.sendHeader(status, headers)

      if(template){
        Haml.render(scope, picard.env.root + '/views/' + template, function(body){
          self.sendBody(body)
          self.finish()
        })
      } else {
        self.sendBody(body)
        self.finish()
      }  
    }
    
    var scope = null;
    
    if(request.method == "GET"){
      for(var key in get_routes){
        var regexp = new RegExp('^'+key+'$'.replace(/:[^/]*/g, '([^/]*)'))
        var match_data = request.uri.path.match(regexp)
        
        if(match_data){
          routes.extract_params(key, match_data, request)
          match_data.shift()
          scope = get_routes[key](request)
          break
        }
      }
    }
    
    if( scope == null )
      scope = { status: 404, body: "<h1> 404 Not Found </h1>" } 
    
    response.on_screen(scope)
  },
  extract_params: function(key, match_data, request){
    var param_keys = key.match(/:[^/]*/g)
    if(param_keys){
      for(var i=0; i < param_keys.length; i++){
        var key = param_keys[i].replace(':', '')
        request.uri.params[key] = match_data[i+1]
      }
    }
  }
}

var get_routes = {}

GLOBAL.get = function(path, handler){
  get_routes[path] = handler
}

exports.engage = routes.engage