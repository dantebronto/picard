var http = require('http')

var Routes = {
  executeCallback: function(request){
    var routes_for_rest_type = Routes.byRestType(request)
    var route, matches
    
    for(var i=0, l = routes_for_rest_type.length; i < l; i++){
      route = routes_for_rest_type[i]
      matches = request.parsed_url().pathname.match(route.path)
      
      if( matches ){ // incoming request matches route
        http.IncomingMessage.prototype._extract_route_params.call(request, route, matches)
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
  byRestType: function(request){
    switch( (request._method || request.method).toUpperCase() ) {
      case 'GET'   : return get_routes
      case 'POST'  : return post_routes
      case 'PUT'   : return put_routes
      case 'DELETE': return delete_routes
    }
  },  
  add: function(path, handler, route_set){
    var keys = []
    
    if(path.constructor != RegExp){ // assume to be a String
      var full_route = '^'+path+'/?$',
          param_keys = path.match(/:[^/]+/g),
          regexp_as_string = full_route.replace(/([^\*]):[^/]+/g, '$1([^/]+)')
          
      if (param_keys && path.match(/\*:\w+$/))
        regexp_as_string = regexp_as_string.replace(/\*.+/, '(.+)')
        
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
  return get_routes.push(Routes.add(path, handler, arguments[2]))
}

var post_routes = []
GLOBAL.post = function(path, handler){
  return post_routes.push(Routes.add(path, handler, arguments[2]))
}

var put_routes = []
GLOBAL.put = function(path, handler){
  return put_routes.push(Routes.add(path, handler, arguments[2]))
}

var delete_routes = []
GLOBAL.del = function(path, handler){
  return delete_routes.push(Routes.add(path, handler, arguments[2]))
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
  return route_set_cache[name]
}

exports.routes = Routes