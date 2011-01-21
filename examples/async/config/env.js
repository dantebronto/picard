var Picard = require('../../../lib/picard')

Picard.config({ // All possible options
  root: __dirname.replace(/\/config/, ''),
  port: 9900,
  public: '/public',
  views: '/views',
  mode: 'production' // In development mode, view templates will not be cached.
})

// For any of the above, you can can also do
// Picard.set('root', __dirname)

Picard.start()

// Use exports object here to keep Picard from
// polluting the global namespace, 
// or just make Picard global above by dropping 'var'

module.exports = Picard