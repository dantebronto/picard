var sys = require('sys')
var Haml = require('./haml')
var json = require('./json2')

var get_routes = {}

var routes = {
  engage: function(request, response){
    var scope = null;

    if(request.method == "GET"){
      for(var key in get_routes){
        
        var regexp = new RegExp(key.replace(/:[^/]*/g, '([^/]*)'))
        var match_data = request.uri.path.match(regexp)
        
        if(match_data){
          routes.extract_params(key, match_data, request)
          match_data.shift()
          scope = get_routes[key](request)
          break
        }
      }
    }
    routes.on_screen(response, scope)
  },
  on_screen: function(response, scope){
    if( scope != null && typeof(scope) == 'object' ){
      scope.response = response
      routes.render(scope)  
    } else if( typeof(scope) == 'string' ) {
      routes.render({response: response, text: scope})
    } else if( scope == null ) {
      routes.render({response: response, text: "<h1>404 Not Found</h1>", status: 404})
    } else {
      routes.render({response: response, text: "<h1>500 Error</h1>", status: 500})
    }
  },
  render: function(scope){
    var response = scope.response
    var status = scope.status || 200
    var body = scope.text || scope.body || ''
    var type = scope.type || "text/html"
    var template = scope.template || null
    var headers = scope.headers || {}

    headers['Content-Type'] = type
    response.sendHeader(status, headers)

    if(template){
      Haml.render(scope, picard.env.root + '/views/' + template, function(body){
        response.sendBody(body)
        response.finish()
      })
    } else {
      response.sendBody(body)
      response.finish()
    }
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

GLOBAL.get = function(path, handler){
  get_routes[path] = handler
}

exports.engage = routes.engage