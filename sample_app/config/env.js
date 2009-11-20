require('../../picard/lib/picard')

picard.env = {
 root: __filename.replace(/\/config\/env.js$/, ''),
 mode: 'development',
 port: 9900
}

picard.start()