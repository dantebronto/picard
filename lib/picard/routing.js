var http = require('http')

var Routes = {
  
  // API functions for merging into Picard
  publicFuncs: ['get', 'post', 'put', 'del', 'helpers', 'routeSet'],
  
  init: function(){ 
    var methods = Routes.publicFuncs,
        RoutingAPI = {}
      
    for(var i=0, j = methods.length; i < j; i++ )
      RoutingAPI[methods[i]] = Routes[methods[i]]
    
    RoutingAPI.globalize = Routes.globalize
    RoutingAPI.executeCallback = Routes.executeCallback
    
    return RoutingAPI
  },
  executeCallback: function(request){
    var routesByType = Routes.byRestType(request)
    var route, matches
    
    for(var i=0, l = routesByType.length; i < l; i++){
      route = routesByType[i]
      matches = request.parsedUrl().pathname.match(route.path)
      
      if( matches ){ // incoming request matches route
        if ( request.route ){
          if ( request.route == route )
            request.route = null
          continue
        }
        request.extractRouteParams(route, matches)
        try {
          request.route = route            
          return route.handler(request) // call programmer defined action
        } catch(ex) {
          request.handleException(ex)
        }
      }
    }
    return 'static'
  },
  byRestType: function(request){
    switch( (request._method || request.method).toUpperCase() ) {
      case 'GET'   : return Routes.getRoutes
      case 'POST'  : return Routes.postRoutes
      case 'PUT'   : return Routes.putRoutes
      case 'DELETE': return Routes.deleteRoutes
    }
  },  
  add: function(path, handler, routeSet){
    var keys = []
    
    if(path.constructor != RegExp){ // assume to be a String
      var full_route = '^'+path+'/?$',
          param_keys = path.match(/:[^/]+/g),
          regexp_as_string = full_route.replace(/([^\*]):[^/]+/g, '$1([^/]+)')
          
      if (param_keys && path.match(/\*:\w+$/))
        regexp_as_string = regexp_as_string.replace(/\*.+/, '(.+)')
        
      path = new RegExp(regexp_as_string)
      if(param_keys)
        for(var i=0, l = param_keys.length; i < l; i++)
          keys[keys.length] = param_keys[i].replace(/^:/, '')
    }
    
    return {
      path: path,
      handler: handler,
      keys: keys,
      routeSet: routeSet
    } 
  },
  getRoutes: [],
  postRoutes: [],
  putRoutes: [],
  deleteRoutes: [],
  globalHelpers: {},
  routeSetCache: {},
  get: function(path, handler){ /* optional param: [, routeSet] */
    Routes.getRoutes.push(Routes.add(path, handler, arguments[2]))
    return this
  },
  post: function(path, handler){
    Routes.postRoutes.push(Routes.add(path, handler, arguments[2]))
    return this
  },
  put: function(path, handler){
    Routes.putRoutes.push(Routes.add(path, handler, arguments[2]))
    return this
  },
  del: function(path, handler){
    Routes.deleteRoutes.push(Routes.add(path, handler, arguments[2]))
    return this
  },
  helpers: function(obj){
    if ( obj ) {
      Routes.globalHelpers = obj
      return this
    }
    return Routes.globalHelpers
  },
  routeSet: function(name, handler){
    if ( typeof name == 'function' ){
      handler = name
      name = name.toString()
    }
    
    if( handler ){
      Routes.routeSetCache[name] = new RouteSet(name)
      handler.apply(Routes.routeSetCache[name])
      return this
    }
    return Routes.routeSetCache[name]
  },
  globalize: function(){
    var methods = Routes.publicFuncs
    for(var i=0, j = methods.length; i < j; i++ ){
      GLOBAL[methods[i]] = Routes[methods[i]]
    }
    return this;
  }
}

var RouteSet = function(name){
  this.name = name
  this.pathPrefix = ''
  this.helpersCache = {}
  return this
}

RouteSet.prototype = {
  helpers: function(obj){ 
    if( obj ){
      this.helpersCache = obj
      return this
    } 
    return this.helpersCache 
  },
  get:  function(path, handler){ 
    Routes.get( this.pathPrefix + path, handler, this) 
    return this
  },
  post: function(path, handler){ 
    Routes.post(this.pathPrefix + path, handler, this) 
    return this
  },
  put:  function(path, handler){ 
    Routes.put( this.pathPrefix + path, handler, this) 
    return this
  },
  del:  function(path, handler){ 
    Routes.del( this.pathPrefix + path, handler, this) 
    return this
  }
}

module.exports = Routes.init()