require('../../picard/lib/picard')

Picard.env = {
 root: __filename.replace(/\/config\/env.js$/, ''),
 port: 9900,
 public_dir: '/public',
 views: '/views',
 mode: 'development' // In development mode, requests parameters will be logged.
}                    // Additionally, view templates will not be cached.

Picard.start()
