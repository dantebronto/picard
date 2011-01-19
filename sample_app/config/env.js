var Picard = require('../../lib/picard')

Picard.config({
  root: __dirname.replace(/\/config/, ''),
  port: 9900,
  public: '/public',
  views: '/views',
  mode: 'production' // In development mode, view templates will not be cached.
})

// can also do
// Picard.set('root', __dirname)

Picard.start()

module.exports = Picard