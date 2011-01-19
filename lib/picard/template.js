var merge = require('./merge'),
    mime = require('./mime'),
    fs = require('fs')

var Template = {
  cache: {},  
  ext: 'haml',
  compile: require('./haml'),
  
  buildAndSend: function(req, scope){
    scope = Template.extendScope(req, scope)
    
    Template.renderTemplate(scope, function(){
      Template.renderLayout(scope, function(){
        req.sendData(scope)
      })
    })
  },
  filename: function(meat){
    return this.root + this.views + '/' + meat + '.' + this.ext
  },
  renderTemplate: function(scope, callback){
    if ( typeof scope.template != 'string' ) {
      callback()
      return
    }
    Template.getCached(this.filename(scope.template), function(template){
      scope.body = Template.safeRender(template, scope)
      callback()
    })
  },
  renderLayout: function(scope, callback){
    if ( typeof scope.layout != 'string' ){
      callback()
      return
    }
    Template.getCached(this.filename(scope.layout), function(template){
      var layoutContent = Template.safeRender(template, scope)
      var yield = layoutContent.match(/\=\=yield\(\)/)
      if ( yield ) scope.body = layoutContent.replace(yield, scope.body)
      callback()
    })
  },
  getCached: function(filename, callback){
    if ( this.cache[filename] && this.mode != 'development' )
      callback(this.cache[filename])
    else
      fs.readFile(filename, function(err, body){
        if ( err && err.message ){
          callback(function(){ return err.message })
          return // something went wrong when reading file
        }
        Template.cache[filename] = Template.compile(body.toString())
        callback(Template.cache[filename])
      })
  },
  renderPartial: function(name, scope, partialScope){
    var body, 
        filename = this.filename(name)
    
    if ( typeof Template.cache[filename] == 'undefined' || this.mode == 'development' ) {
      body = fs.readFileSync(filename) // the only blocking call in the framework, only blocks once until cached
      Template.cache[filename] = Template.compile(body.toString())
    }
    var renderScope = scope
    if( partialScope ) renderScope = merge({}, scope, partialScope)
    body = Template.safeRender(Template.cache[filename], renderScope)
    return body
  },
  safeRender: function(template, scope){
    scope.yield = function(name){ return "==yield()" }
    scope.partial = function(name, partialScope){ 
      return Template.renderPartial(name, scope, partialScope) 
    }
    return template(scope)
  },
  extendScope: function(req, scope){
    var sharedHelpers = {}
    
    if ( typeof helpers == 'function' )
      sharedHelpers = helpers()
    
    if ( req.route && req.route.routeSet ){
      // merge route set helpers into view scope
      var mergedHelpers = merge({}, sharedHelpers, req.route.routeSet.helpers())
      scope = merge({}, mergedHelpers, scope)
      
      // use route_set layout if none defined on this scope
      if ( typeof scope.layout == 'undefined' && req.route.routeSet.layout )
        scope.layout = req.route.routeSet.layout
    
    } else if ( Object.keys(sharedHelpers) != 0 ) {
      scope = merge({}, sharedHelpers, scope)
    }
    return scope
  },
  serveStatic: function(req, file){
    var name = req.parsedUrl().pathname,
        filename = file || this.root + this.public + name
        
    fs.readFile(filename, 'binary', function(err, content){
      if ( err ) req.onScreen(null)
      
      req.onScreen({ 
        body: content, 
        type: mime.lookupExtension(filename.match(/.[^.]*$/)[0]),
        encoding: 'binary'
      })
    }) 
  }
}

exports.template = Template