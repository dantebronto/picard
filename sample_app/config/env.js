require('../../picard/lib/picard')

Picard.env = {
 root: __filename.replace(/\/config\/env.js$/, ''),
 mode: 'development', /* Picard currently only cares about production and development modes */
 port: 9900,
 public_dir: '/public',
 views: '/views'
}

Picard.start()
