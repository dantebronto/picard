var Conf = {
  config: function(object){
    for (var key in object)
      Conf.set.call(this, key, object[key])
  },
  set: function(key, val){
    if( !this.env ) this.env = {}
    
    switch( key ) {
      case 'root'   : 
        this.template.root = val
        break
      case 'public' : 
        this.template.public = val
        break
      case 'views'  : 
        this.template.views = val
        break
      case 'port'   : 
        this.env.port = val
        break
      case 'mode'   : 
        this.template.mode = this.env.mode = val
        break
      default       :
        this[key] = val
        break
    }
  },
  rootDir: function(){
    try {
      var fullPath = process.mainModule.filename
      return require('path').dirname(fullPath)
    } catch(e) {
      throw "Must set root directory via Picard.set('root', __dirname) or similar"
    }
  }
}

exports.config  = Conf.config
exports.set     = Conf.set
exports.rootDir = Conf.rootDir