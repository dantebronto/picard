var sys = require('sys')
var Haml = require('./haml')

var get_routes = {}

function render(scope){
  var status = scope.status || "200"
  var body = scope.body || scope.text || null
  var type = scope.type || "text/html"  
}

var routes = {
  engage: function(request, response){

//sys.puts(picard.env.root + "/views")

// { full: "/status?name=ryan",
//   path: "/status",
//   queryString: "name=ryan",
//   params: { "name": "ryan" },
//   fragment: ""
// }
    var handler = null;
    
    if(request.method == "GET" && get_routes[request.uri.path] != undefined){
      handler = get_routes['/foo']()
    }
    
    if(typeof(handler == 'object')
      routes.with_scope(response, handler)
    else if(typeof(handler) == 'string')
      routes.plain(response, handler)
    else if(handler == null)
      routes.not_found(response)
    else 
      routes.error(response)
  },
  with_scope: function(response, handler){
    // do nothign for now
  },
  plain: function(response, handler){
    response.sendHeader(200, {"Content-Type": "text/html"})
    response.sendBody(handler)    
    response.finish()    
  },
  not_found: function(response){
    response.sendHeader(404, {"Content-Type": "text/html"})
    response.sendBody("<h1>404 Not Found</h1>")    
    response.finish()
  },
  error: function(response){
    response.sendHeader(500, {"Content-Type": "text/html"})
    response.sendBody("<h1>500 Error</h1>")    
    response.finish()
  }
}

GLOBAL.get = function(path, handler){
  get_routes[path] = handler
  sys.puts(get_routes[path])
}

exports.engage = routes.engage;



