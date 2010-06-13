var routes = {
  
  execute_callback: function(request){
    var routes_for_rest_type = routes.rest_type(request)
    var route, matches
    
    for(var i=0, l = routes_for_rest_type.length; i < l; i++){
      route = routes_for_rest_type[i]
      matches = request.parsed_url().pathname.match(route.path)
      
      if( matches ){ // incoming request matches route
        Picard.internal_request_functions._extract_route_params.call(request, route, matches)
        try {
          request.route = route            
          return route.handler(request) // call programmer defined action
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
  
  add: function(path, handler, route_set){
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
      keys: keys,
      route_set: route_set
    } 
  }
  
}

var get_routes = []
GLOBAL.get = function(path, handler){ /* optional param: [, route_set] */
  return get_routes.push(routes.add(path, handler, arguments[2]))
}

var post_routes = []
GLOBAL.post = function(path, handler){
  return post_routes.push(routes.add(path, handler, arguments[2]))
}

var put_routes = []
GLOBAL.put = function(path, handler){
  return put_routes.push(routes.add(path, handler, arguments[2]))
}

var delete_routes = []
GLOBAL.del = function(path, handler){
  return delete_routes.push(routes.add(path, handler, arguments[2]))
}

var global_helpers = {} /* for getting and setting shared helpers outside of a route_set */
GLOBAL.helpers = function(obj){
  if ( obj ) global_helpers = obj; return global_helpers
}

var route_set_cache = {}
GLOBAL.route_set = function(name, handler){
  if ( typeof name == 'function' ){
    handler = name
    name = name.toString()
  }
  
  var route_set_scope = {
    name: name,
    path_prefix: '',
    helpers: function(obj){ if( obj ) this.helpers_cache = obj; return this.helpers_cache },
    get:  function(path, handler){ GLOBAL.get( this.path_prefix + path, handler, this) },
    post: function(path, handler){ GLOBAL.post(this.path_prefix + path, handler, this) },
    put:  function(path, handler){ GLOBAL.put( this.path_prefix + path, handler, this) },
    del:  function(path, handler){ GLOBAL.del( this.path_prefix + path, handler, this) },
    helpers_cache: {},
    _handler: handler
  }
  if( handler ){
    route_set_cache[name] = route_set_scope
    handler.apply(route_set_scope)
  }
}

GLOBAL.route_sets = function(){
  return route_set_cache
}

Picard.routes = routes