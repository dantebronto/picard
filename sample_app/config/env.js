require('../../picard/lib/picard')

picard.env = {
 root: __filename.replace(/\/config\/env.js$/, ''),
 mode: 'production',
 port: 9900,
 public_dir: '/public',
 views: '/views'
}

picard.start()
