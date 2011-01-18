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
        this.template.public_dir = val
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
    }
  }
}

exports.config = Conf.config
exports.set    = Conf.set