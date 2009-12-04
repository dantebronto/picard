var routes = {
  
  execute_callback: function(request){
    var routes_for_rest_type = routes.rest_type(request)
    
    for(var i=0; i < routes_for_rest_type.length; i++){
      var route = routes_for_rest_type[i]
      var matches = request.uri.path.match(route.path)
      
      if( matches ){ // incoming request matches route
        request.extract_route_params(route, matches)
        try {
          return route.handler(request)
        } catch(ex) {
          request.handle_exception(ex)
        }
      }
    }
    return 'static'
  },

  rest_type: function(request){
    var route_array = []
    if(request.method == 'GET')
      route_array = get_routes
    else if(request.method == 'POST'){
      route_array = post_routes
      
      var rest_method = (request._method || '').toUpperCase()
      
      if( rest_method == 'PUT' )
        route_array = put_routes
      else if ( rest_method == 'DELETE' )
        route_array = delete_routes
    }
    return route_array
  },
  
  add: function(path, handler){
    var keys = []
    
    if(path.constructor != RegExp){ // assume to be a String
      var full_route = '^'+path+'$'
      var param_keys = path.match(/:[^/]*/g)
      path = new RegExp(full_route.replace(/:[^/]*/g, '([^/]*)'))
      
      if(param_keys)
        for(var i=0; i < param_keys.length; i++)
          keys[keys.length] = param_keys[i].replace(':', '')
    }
    
    return {
      path: path,
      handler: handler,
      keys: keys 
    } 
  }
  
}

var get_routes = []
var post_routes = []
var put_routes = []
var delete_routes = []

GLOBAL.get = function(path, handler){
  get_routes[get_routes.length] = routes.add(path, handler)
}
GLOBAL.post = function(path, handler){
  post_routes[post_routes.length] = routes.add(path, handler)
}
GLOBAL.put = function(path, handler){
  put_routes[put_routes.length] = routes.add(path, handler)
}
GLOBAL.del = function(path, handler){
  delete_routes[delete_routes.length] = routes.add(path, handler)
}

picard = exports
picard.routes = routes