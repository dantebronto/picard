require('../vendor/picard/lib/picard')

var sys = require('sys')

picard.env = {
 root: __filename.replace(/\/config\/env.js$/, ''),
 mode: 'development',
 port: 9900
}

picard.start()