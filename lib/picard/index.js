var Picard = { 
  config:   require('./config').config,
  set:      require('./config').set,
  version:  require('./server').version,
  start:    require('./server').start,
  template: require('./template').template
}

require('./merge')(Picard, require('./routing'))

Picard.config({ // default settings
  root: require('./config').rootDir(),
  port: 9900,
  public: '/public',
  views: '/views',
  mode: 'production'
})

require('./request')

module.exports = Picard