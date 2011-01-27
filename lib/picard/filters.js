var Filter = {
  before: function(matcher, cb){
    if ( toString.call(matcher) == '[object Function]' ){
      cb = matcher
      matcher = '.*'
    }
    if ( !('befores' in this) ) this.befores = []
    
    this.befores.push({ 
      matcher: new RegExp(matcher), handler: cb 
    })
    return this
  },
  after: function(matcher, cb){
    if ( toString.call(matcher) == '[object Function]' ){
      cb = matcher
      matcher = '.*'
    }
    if ( !('afters' in this) ) this.afters = []
    
    this.afters.push({ 
      matcher: new RegExp(matcher), handler: cb 
    })
    return this
  }
}

module.exports = Filter