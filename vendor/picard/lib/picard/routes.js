var sys = require('sys')

var routes = {
  engage: function(request, response){
    return "foo"
  }  
}

exports.engage = routes.engage;



