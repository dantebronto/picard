var Picard = require('../../lib/picard').start()
var _ = require('underscore') // assumes underscore.js is require-able

Picard.template.ext = 'html.ejs'     // default is 'haml'
Picard.template.compile = _.template // template compilation function, see underscore.js docs: http://documentcloud.github.com/underscore/#template 

Picard.get('/alternate_template', function(){
  return {
    layout: 'application',
    template: 'custom',
    name: 'Jean-Luc Picard',
    people: ['Riker', 'Crusher', 'Data'],
    _: _ // allow use of underscore in views
  }
})