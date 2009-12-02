var posix = require('posix')
var sys = require('sys')
var haml = require('./haml')

var routes = {
  engage: function(request, response){ // wraps request/response functions
    
    request.extract_form_params = function(chunk){
      if( chunk == undefined ) { return }
      var chunks = chunk.split('&')
      for(var i in chunks){
        var k_v = chunks[i].split('=')
        this[k_v[0]] = k_v[1]
      }
    }
    
    request.extract_route_params = function(route, match_data){
      if( match_data == null ){ return } else { match_data.shift() }
      this.captures = []
      
      for(var i=0; i < route.keys.length; i++){
        this[route.keys[i]] = match_data[i]
        match_data.splice(i,1)
      }
      
      for(var i=0; i < match_data.length; i++)
        this.captures[i] = match_data[i]
    }
    
    request.resolve = function(response){
      var scope = null
      
      scope = routes.execute_callback(this)
      
      if( scope == 'async' )
        return
      
      if( scope == null )
        scope = this.serve_static()

      this.on_screen(scope) 
    }
    
    request.serve_static = function(){
      try { // TODO: better way to do this?
        var filename = picard.env.root + '/public' + this.uri.path
        scope = { 
          body: posix.cat(filename).wait(),
          type: picard.mime.lookup_extension(filename.match(/.[^.]*$/)[0])
        }
      } catch(e) {
        scope = null
      }
      return scope
    }
        
    request.on_screen = function(scope){
      var self = this
    
      if ( scope == null )
        scope = { status: 404, body: "<h1> 404 Not Found </h1>" }
        
      var body = scope.text || scope.body || ''
      var headers = scope.headers || {}
      
      if(typeof(scope) == 'string')
        body = scope
    
      headers['Content-Type'] = scope.type || "text/html"
      response.sendHeader(scope.status || 200, headers)
    
      if(scope.template){
        var template_path = picard.env.root + '/views/' + scope.template
        haml.render(scope, template_path, function(body){
          response.sendBody(body)
          response.finish()
        })
      } else {
        response.sendBody(body)
        response.finish()
      }  
    }
    
    request.handle_exception = function(ex) {
      sys.puts('')
      sys.puts(ex.message)
      sys.puts(ex.stack)

      var body = '<h1> 500 Error </h1>'
      body += '<h3>' + ex.message + '</h3>'
      body += '<pre>' + ex.stack + '</pre>'

      response.sendHeader(500, { 'Content-Type': 'text/html' });
      response.sendBody(body);
      response.finish();
    }
    
    request.addListener('body', request.extract_form_params)
    request.addListener('complete', function(){ request.resolve(response) })
    
  },
  
  // begin route methods
  
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
  },

  rest_type: function(request){
    var route_array = []
    if(request.method == "GET")
      route_array = get_routes
    else if(request.method == "POST"){
      route_array = post_routes
      
      var rest_method = request._method
      
      if( rest_method == 'put' )
        route_array = put_routes
      else if ( rest_method == 'delete' )
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

exports.engage = routes.engage

picard.mime = {
  lookup_extension : function(ext) {
    return picard.mime.TYPES[ext.toLowerCase()];
  },
  TYPES : // List of most common mime-types, stolen from Rack.
    { ".3gp" : "video/3gpp"
    , ".a" : "application/octet-stream"
    , ".ai" : "application/postscript"
    , ".aif" : "audio/x-aiff"
    , ".aiff" : "audio/x-aiff"
    , ".asc" : "application/pgp-signature"
    , ".asf" : "video/x-ms-asf"
    , ".asm" : "text/x-asm"
    , ".asx" : "video/x-ms-asf"
    , ".atom" : "application/atom+xml"
    , ".au" : "audio/basic"
    , ".avi" : "video/x-msvideo"
    , ".bat" : "application/x-msdownload"
    , ".bin" : "application/octet-stream"
    , ".bmp" : "image/bmp"
    , ".bz2" : "application/x-bzip2"
    , ".c" : "text/x-c"
    , ".cab" : "application/vnd.ms-cab-compressed"
    , ".cc" : "text/x-c"
    , ".chm" : "application/vnd.ms-htmlhelp"
    , ".class" : "application/octet-stream"
    , ".com" : "application/x-msdownload"
    , ".conf" : "text/plain"
    , ".cpp" : "text/x-c"
    , ".crt" : "application/x-x509-ca-cert"
    , ".css" : "text/css"
    , ".csv" : "text/csv"
    , ".cxx" : "text/x-c"
    , ".deb" : "application/x-debian-package"
    , ".der" : "application/x-x509-ca-cert"
    , ".diff" : "text/x-diff"
    , ".djv" : "image/vnd.djvu"
    , ".djvu" : "image/vnd.djvu"
    , ".dll" : "application/x-msdownload"
    , ".dmg" : "application/octet-stream"
    , ".doc" : "application/msword"
    , ".dot" : "application/msword"
    , ".dtd" : "application/xml-dtd"
    , ".dvi" : "application/x-dvi"
    , ".ear" : "application/java-archive"
    , ".eml" : "message/rfc822"
    , ".eps" : "application/postscript"
    , ".exe" : "application/x-msdownload"
    , ".f" : "text/x-fortran"
    , ".f77" : "text/x-fortran"
    , ".f90" : "text/x-fortran"
    , ".flv" : "video/x-flv"
    , ".for" : "text/x-fortran"
    , ".gem" : "application/octet-stream"
    , ".gemspec" : "text/x-script.ruby"
    , ".gif" : "image/gif"
    , ".gz" : "application/x-gzip"
    , ".h" : "text/x-c"
    , ".hh" : "text/x-c"
    , ".htm" : "text/html"
    , ".html" : "text/html"
    , ".ico" : "image/vnd.microsoft.icon"
    , ".ics" : "text/calendar"
    , ".ifb" : "text/calendar"
    , ".iso" : "application/octet-stream"
    , ".jar" : "application/java-archive"
    , ".java" : "text/x-java-source"
    , ".jnlp" : "application/x-java-jnlp-file"
    , ".jpeg" : "image/jpeg"
    , ".jpg" : "image/jpeg"
    , ".js" : "application/javascript"
    , ".json" : "application/json"
    , ".log" : "text/plain"
    , ".m3u" : "audio/x-mpegurl"
    , ".m4v" : "video/mp4"
    , ".man" : "text/troff"
    , ".mathml" : "application/mathml+xml"
    , ".mbox" : "application/mbox"
    , ".mdoc" : "text/troff"
    , ".me" : "text/troff"
    , ".mid" : "audio/midi"
    , ".midi" : "audio/midi"
    , ".mime" : "message/rfc822"
    , ".mml" : "application/mathml+xml"
    , ".mng" : "video/x-mng"
    , ".mov" : "video/quicktime"
    , ".mp3" : "audio/mpeg"
    , ".mp4" : "video/mp4"
    , ".mp4v" : "video/mp4"
    , ".mpeg" : "video/mpeg"
    , ".mpg" : "video/mpeg"
    , ".ms" : "text/troff"
    , ".msi" : "application/x-msdownload"
    , ".odp" : "application/vnd.oasis.opendocument.presentation"
    , ".ods" : "application/vnd.oasis.opendocument.spreadsheet"
    , ".odt" : "application/vnd.oasis.opendocument.text"
    , ".ogg" : "application/ogg"
    , ".p" : "text/x-pascal"
    , ".pas" : "text/x-pascal"
    , ".pbm" : "image/x-portable-bitmap"
    , ".pdf" : "application/pdf"
    , ".pem" : "application/x-x509-ca-cert"
    , ".pgm" : "image/x-portable-graymap"
    , ".pgp" : "application/pgp-encrypted"
    , ".pkg" : "application/octet-stream"
    , ".pl" : "text/x-script.perl"
    , ".pm" : "text/x-script.perl-module"
    , ".png" : "image/png"
    , ".pnm" : "image/x-portable-anymap"
    , ".ppm" : "image/x-portable-pixmap"
    , ".pps" : "application/vnd.ms-powerpoint"
    , ".ppt" : "application/vnd.ms-powerpoint"
    , ".ps" : "application/postscript"
    , ".psd" : "image/vnd.adobe.photoshop"
    , ".py" : "text/x-script.python"
    , ".qt" : "video/quicktime"
    , ".ra" : "audio/x-pn-realaudio"
    , ".rake" : "text/x-script.ruby"
    , ".ram" : "audio/x-pn-realaudio"
    , ".rar" : "application/x-rar-compressed"
    , ".rb" : "text/x-script.ruby"
    , ".rdf" : "application/rdf+xml"
    , ".roff" : "text/troff"
    , ".rpm" : "application/x-redhat-package-manager"
    , ".rss" : "application/rss+xml"
    , ".rtf" : "application/rtf"
    , ".ru" : "text/x-script.ruby"
    , ".s" : "text/x-asm"
    , ".sgm" : "text/sgml"
    , ".sgml" : "text/sgml"
    , ".sh" : "application/x-sh"
    , ".sig" : "application/pgp-signature"
    , ".snd" : "audio/basic"
    , ".so" : "application/octet-stream"
    , ".svg" : "image/svg+xml"
    , ".svgz" : "image/svg+xml"
    , ".swf" : "application/x-shockwave-flash"
    , ".t" : "text/troff"
    , ".tar" : "application/x-tar"
    , ".tbz" : "application/x-bzip-compressed-tar"
    , ".tcl" : "application/x-tcl"
    , ".tex" : "application/x-tex"
    , ".texi" : "application/x-texinfo"
    , ".texinfo" : "application/x-texinfo"
    , ".text" : "text/plain"
    , ".tif" : "image/tiff"
    , ".tiff" : "image/tiff"
    , ".torrent" : "application/x-bittorrent"
    , ".tr" : "text/troff"
    , ".txt" : "text/plain"
    , ".vcf" : "text/x-vcard"
    , ".vcs" : "text/x-vcalendar"
    , ".vrml" : "model/vrml"
    , ".war" : "application/java-archive"
    , ".wav" : "audio/x-wav"
    , ".wma" : "audio/x-ms-wma"
    , ".wmv" : "video/x-ms-wmv"
    , ".wmx" : "video/x-ms-wmx"
    , ".wrl" : "model/vrml"
    , ".wsdl" : "application/wsdl+xml"
    , ".xbm" : "image/x-xbitmap"
    , ".xhtml" : "application/xhtml+xml"
    , ".xls" : "application/vnd.ms-excel"
    , ".xml" : "application/xml"
    , ".xpm" : "image/x-xpixmap"
    , ".xsl" : "application/xml"
    , ".xslt" : "application/xslt+xml"
    , ".yaml" : "text/yaml"
    , ".yml" : "text/yaml"
    , ".zip" : "application/zip"
    }
};