var http = require('http')
var merge = require('./merge')

var Routes = {
  
  // API functions for merging into Picard and/or globalizing
  publicFuncs: ['get', 'post', 'put', 'del', 'helpers', 'routeSet'],
  
  init: function(){ 
    var methods = Routes.publicFuncs.concat([
      'globalize', 'executeCallback', 'before', 'after' 
    ])
    
    var routingAPI = {}
    
    for(var i=0, j = methods.length; i < j; i++)
      routingAPI[methods[i]] = Routes[methods[i]]
    
    routingAPI.globalHelpers = Routes.globalHelpers // ???
    
    return routingAPI
  },
  
  executeCallback: function(request, cb){
    var routesByType = Routes.byRestType(request),
        route, matches, path
    
    for(var i=0, l = routesByType.length; i < l; i++){
      route = routesByType[i]
      path = request.parsedUrl().pathname
      matches = path.match(route.path)
      
      if( matches ){ // incoming request matches route
        if ( request.route ){
          if ( request.route == route )
            request.route = null // match the next route
          continue
        }
        
        request.extractRouteParams(route, matches)
        
        try {
          request.route = route

          if ( route.routeSet ){
            
            if ( route.routeSet.befores ){
              route.routeSet.setMatchingBeforeFiltersOn(request, path)
              request.afterMainHandler = cb
              request.filterDone()
            } else {
              cb(route.handler(request)) // default
            }
            
          } else {
            cb(route.handler(request))   // call programmer defined action
          }
        } catch(ex) {
          request.handleException(ex)
        }
      }
    }
    if ( !request.route )
      cb('static')
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
    
    if( toString.call(path) != '[object RegExp]' ){ // assume to be a String
      var fullRoute = '^'+path+'/?$',
          paramKeys = path.match(/:[^/]+/g),
          regExpAsString = fullRoute.replace(/([^\*]):[^/]+/g, '$1([^/]+)')
          
      if ( paramKeys && path.match(/\*:\w+$/) )
        regExpAsString = regExpAsString.replace(/\*.+/, '(.+)')
        
      path = new RegExp(regExpAsString)
      if( paramKeys )
        for(var i=0, l = paramKeys.length; i < l; i++)
          keys[keys.length] = paramKeys[i].replace(/^:/, '')
    }
    
    var route = new Route({
      path: path,
      handler: handler,
      keys: keys,
      routeSet: routeSet
    })
    
    if ( typeof route.routeSet == 'undefined' )
      route.helpers = Routes.helpers
    
    return route
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
    if ( obj ){
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
      global[methods[i]] = Routes[methods[i]]
    }
    return this;
  }
}

var Route = function(o){
  this.path     = o.path
  this.handler  = o.handler
  this.keys     = o.keys
  this.routeSet = o.routeSet
  return this
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
  },
  setMatchingBeforeFiltersOn: function(req, path){
    req.beforeFilters = []
    for(var i=0, len = this.befores.length; i<len; i++){
      if ( this.befores[i].matcher.test(path) ){
        req.beforeFilters.push(this.befores[i])
      }
    }
  }
}

merge(RouteSet.prototype, require('./filters'))

module.exports = Routes.init()