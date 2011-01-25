var Picard = require('../../lib/picard').start()
var _ = require('underscore') // assumes underscore.js is require-able

Picard.template.ext = 'html.ejs'     // default is 'haml'
Picard.template.compile = _.template // template compilation function, see underscore.js docs:
                                     // http://documentcloud.github.com/underscore/#template 

Picard.helpers({
  _ : _                              // make underscore available in the view scope
})

Picard.get('/underscore_templates', function(){
  return {
    layout: 'application',
    template: 'underscore',
    name: 'Jean-Luc Picard',
    people: ['Riker', 'Crusher', 'Data']
  }
})