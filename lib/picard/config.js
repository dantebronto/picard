var Conf = {
  config: function(object){
    for (var key in object)
      Conf.set.call(this, key, object[key])  
    return this
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
    return this
  },
  rootDir: function(){
    try {
      var topMod = module.parent
      while ( topMod.parent ) topMod = topMod.parent
      return require('path').dirname(topMod.filename)
    } catch(e) {
      throw "Must set root directory via Picard.set('root', __dirname) or similar"
    }
  }
}

exports.config  = Conf.config
exports.set     = Conf.set
exports.rootDir = Conf.rootDir