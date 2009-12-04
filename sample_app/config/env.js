require('../../picard/lib/picard')

picard.env = {
 root: __filename.replace(/\/config\/env.js$/, ''),
 mode: 'production',
 port: 9900,
 public: '/public',
 views: '/views'
}

picard.start()
