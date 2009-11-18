var sys = require('sys')
var Haml = require('./haml')

var get_routes = {}

function render(scope){
  var response = scope.response
  var status = scope.status || "200"
  var text = scope.text || null
  var type = scope.type || "text/html"
  //sys.puts(picard.env.root + "/views")

  response.sendHeader(status, {"Content-Type": type})
  if(text){ response.sendBody(text) }
  response.finish()
}

var routes = {
  engage: function(request, response){
    var scope = null;
    
    if(request.method == "GET" && get_routes[request.uri.path] != undefined){
      scope = get_routes[request.uri.path]()
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



