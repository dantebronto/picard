var sys = require('sys')
var Haml = require('./haml')
var json = require('./json2')

var get_routes = {}

function render(scope){
  var response = scope.response
  var status = scope.status || 200
  var body = scope.text || scope.body || null
  var type = scope.type || "text/html"
  var template = scope.template || null
  
  if( template ){ template = picard.env.root + '/views/' + template }

  if(template){
    Haml.render(scope, template, function(rendered_content){   
      response.sendHeader(200, {"Content-Type": type})
      response.sendBody(rendered_content)
      response.finish()
    }) 
  } else if(body) {
    response.sendHeader(status, {"Content-Type": type})
    response.sendBody(body)
    response.finish()
  }
}

var routes = {
  engage: function(request, response){
    var scope = null;
    
    if(request.method == "GET"){
      for(var key in get_routes){
        var regexp = new RegExp(key.replace(/:[^/]*/g, '([^/]*)'))

        match_data = request.uri.path.match(regexp)
        if(match_data){
          match_data.shift()
          scope = get_routes[key].apply(null, match_data)
          break
        }
      }
    }
    routes.on_screen(response, scope)
  },
  on_screen: function(response, scope){
    if( scope != null && typeof(scope) == 'object' ){
      scope.response = response
      render(scope)  
    } else if( typeof(scope) == 'string' ) {
      render({response: response, text: scope})
    } else if( scope == null ) {
      render({response: response, text: "<h1>404 Not Found</h1>", status: 404})
    } else {
      render({response: response, text: "<h1>500 Error</h1>", status: 500})
    }
  }
}

GLOBAL.get = function(path, handler){
  get_routes[path] = handler
}

exports.engage = routes.engage;



