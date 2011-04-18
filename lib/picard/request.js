var sys = require('sys'),
    url = require('url'),
    doc = require('./template').template,
    server = require('./server'),
    merge = require('./merge'),
    Routes = require('./routing')

var RequestExtensions = {
  handleException: function(ex){
    this.onScreen({ 
      status: 500, 
      body: '<h1> 500 Error </h1>' +
        '<h3>' + ex.message + '</h3>' +
        '<pre>' + ex.stack + '</pre>'
    })    
    sys.puts(ex.stack)
  },
  handleNotFound: function(){
    this.onScreen({
      status: 404,
      body: '<h1> 404 Not Found </h1>'
    })
  },
  onScreen: function(scope){    
    var req = this,
        type = toString.call(scope)
        
    if ( req.response.finished ) return
    
    if ( type == '[object String]' )
      scope = { text: scope }
    else if ( type == '[object Array]' )
      scope = { status: scope[0], headers: scope[1], body: scope[2] }
    else if ( scope == null ){
      req.handleNotFound()
      return
    }
    
    scope.status   = scope.status   || 200
    scope.headers  = scope.headers  || []
    scope.body     = scope.text     || scope.body || ''
    scope.encoding = scope.encoding || 'utf8'
    
    if ( scope.headers.length == 0 ){
      if ( req.picardServer )
        scope.headers.push([ 'Server', req.picardServer ])
      scope.headers.push([ 'Content-Type', scope.type  || 'text/html' ])
    }
    
    scope.headers = req.setCookies(scope.headers)
    
    if ( scope.status == 500 && !scope.template )
      req.sendData(scope)
    else
      doc.buildAndSend(req, scope)
    
    req.log(scope)
  },
  log: function(scope){
    var now = new Date();
    sys.puts([
      now.getFullYear(), '-', ('0' + (now.getMonth() + 1)).slice(-2), '-', ('0' + (now.getDate())).slice(-2), ' ',
      ('0' + (now.getHours())).slice(-2), ':', ('0' + (now.getMinutes())).slice(-2), ':', ('0' + (now.getSeconds())).slice(-2), ' ',
      (this._method || this.method).toUpperCase(), ' ', 
      this.parsedUrl().pathname, ' ', scope.status
    ].join(''))
  },
  parsedUrl: function() {
    if ( !('url' in this) ) return
    var parsed = url.parse(this.url, true)
    this.parsedUrl = function() { return parsed }
    return parsed
  },
  redirect: function(location){
    this.onScreen({  
      status: 302,
      headers: [[ 'Location', location ]], 
      body: '<a href="'+ location + '">' + location + '</a>' 
    })
  },
  sendData: function(scope){
    if ( !scope.body ) return
    scope.headers.push([ 'Content-Length', scope.body.length ])
    scope.headers.push([ 'Content-Encoding', scope.encoding ])
    this.response.writeHead(scope.status, scope.headers)
    if ( this.method != 'HEAD' ) this.response.write(scope.body, scope.encoding)  
    this.response.end()
  },
  extractFormParams: function(chunk){
    try {
      if ( chunk == undefined ) return
      var chunks = chunk.toString().replace(/\+/g, '%20').split('&')
      
      this.body = ('body' in this) ? this.body + chunk : chunk;
      
      for(var i in chunks){
        var k_v = chunks[i].toString().split('=')
        this[k_v[0]] = decodeURIComponent(k_v[1])
      }
    } catch(ex) {
      this.handleException(ex)
    }
  },
  extractRouteParams: function(route, matchData){
    var i, l
    
    if ( matchData == null ){ return } else { matchData.shift() }
    this.captures = []
    
    for(i=0, l = route.keys.length; i < l; i++)
      this[route.keys[i]] = matchData.shift()
    
    for(i=0, l = matchData.length; i < l; i++)
      this.captures[i] = matchData[i]
  },
  pass: function(){
    try {
      var req = this
      req.parseCookies()
      
      Routes.executeCallback(req, function(scope){
        if( scope == 'static' )
          scope = doc.serveStatic(req)
        if ( scope == null || scope == undefined )
          return
        req.onScreen(scope)
      })
      
    } catch(ex) {
      req.handleException(ex)
    }
  },
  isMultipart: function(){
    return (this.headers['content-type'] || '').indexOf('multipart/form-data') != -1
  },
  cookie: function(name, val, options){
    if ( val === undefined )
      return this.cookies[name]
    
    options = options || {}
    options.value = val
    options.path = options.path || "/"
    
    this.cookies[name] = options
  },
  parseCookies: function(){
    try {
      this.cookies = {}
      var self = this
      var cookieHeader = self.headers['cookie']
      if ( cookieHeader ){
        cookieHeader.split("; ").forEach(function(cookie){
          var parts = cookie.split("=")
          self.cookie(parts[0], decodeURIComponent(parts[1]), { preset: true })
        })
      }
    } catch(ex) {
      this.handleException(ex)
    }
  },
  setCookies: function(headers){
    var ret, name, options
    
    for(name in this.cookies) {
      if( this.cookies[name].preset ){ continue }
      options = this.cookies[name]
      ret = name + '=' + encodeURIComponent(options.value)
      
      if (options.expires)
        ret += '; expires=' + options.expires.toUTCString()
      if (options.path)
        ret += '; path=' + options.path
      if (options.domain)
        ret += '; domain=' + options.domain
      if (options.secure)
        ret += '; secure'
      if (options.httpOnly)
        ret += "; httponly"
      
      headers.push([ "Set-Cookie", ret ])
    }
    return headers
  },
  filterDone: function(){
    var filter, res, req = this
    
    if ( req.beforeFilters && req.beforeFilters.length > 0 ){
      filter = req.beforeFilters.shift()
      
      try {
        res = filter.handler(req) // call the filter

        if ( res === false ){
          req.handleNotFound()
        } else if ( toString.call(res) === '[object Object]' ){
          merge(req, res) // merge before filter result into env
          req.filterDone()
        } else if ( res != undefined ) { // not false or undefined, so keep going
          req.filterDone()
        }
      } catch(ex) {
        req.handleException(ex)
      }
    } else if (req.afterFilters && req.afterFilters.length > 0 ) {
      
      filter = req.afterFilters.shift()
      
      try {
         res = filter.handler(req) // call the filter
         
         if ( res === false ){
           return // stop execution
         } else if ( res != undefined ) { // not false or undefined, so keep going
           req.filterDone()
         }
         
      } catch (ex) {
        req.log('error encountered in after filter: ')
        req.log(ex)
      }
      
    } else { // we're done filtering
      req.afterMainHandler(req.route.handler(req))
    }
  }
}

// extend abstract parent of http.ServerRequest
merge(require('http').IncomingMessage.prototype, RequestExtensions)