var routes = {
  
  execute_callback: function(request){
    var routes_for_rest_type = routes.rest_type(request)
    
    for(var i=0, l = routes_for_rest_type.length; i < l; i++){
      var route = routes_for_rest_type[i]
      var matches = request.parsed_url().pathname.match(route.path)

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
    var rest_method = (request._method || request.method).toUpperCase()
    
    switch( rest_method ) {
      case 'GET'   : route_array = get_routes   ; break
      case 'POST'  : route_array = post_routes  ; break
      case 'PUT'   : route_array = put_routes   ; break
      case 'DELETE': route_array = delete_routes; break
    }
    return route_array
  },
  
  add: function(path, handler){
    var keys = []
    
    if(path.constructor != RegExp){ // assume to be a String
      var full_route = '^'+path+'/?$'
      var param_keys = path.match(/:[^/]+/g)
      regexp_as_string = full_route.replace(/([^\*]):[^/]+/g, '$1([^/]+)')
      if (param_keys && path.match(/\*:\w+$/)) {
        regexp_as_string = regexp_as_string.replace(/\*.+/, '(.+)')
      }
      path = new RegExp(regexp_as_string);
      if(param_keys)
        for(var i=0, l = param_keys.length; i < l; i++)
          keys[keys.length] = param_keys[i].replace(/^:/, '')
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
  get_routes.push(routes.add(path, handler))
}
GLOBAL.post = function(path, handler){
  post_routes.push(routes.add(path, handler))
}
GLOBAL.put = function(path, handler){
  put_routes.push(routes.add(path, handler))
}
GLOBAL.del = function(path, handler){
  delete_routes.push(routes.add(path, handler))
}

picard = exports
picard.routes = routes
