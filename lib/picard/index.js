var Picard = { 
  config:   require('./config').config,
  set:      require('./config').set,
  routes:   require('./routing').routes,
  mime:     require('./mime').mime,
  version:  require('./server').version,
  start:    require('./server').start,
  template: require('./template').template
}

// default configuration values
Picard.config({
  root: __dirname.replace(/\/config/, ''),
  port: 9900,
  public: '/public',
  views: '/views',
  mode: 'production'
})

require('./request_extensions')

module.exports = Picard