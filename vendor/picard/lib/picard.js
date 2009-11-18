var sys = require('sys')
var Haml = require('./picard/haml')

picard = exports;
picard.routes = require('./picard/routes')

sys.puts(picard.routes.engage())

picard.start = function() {
  // simplex.controller.loadAll()

  require('http').createServer(function(request, response) {
    try {
      picard.routes.engage(request, response)
    } catch(ex) {
      picard.handle_exception(ex, response)
    }
  }).listen(picard.env.port)

  sys.puts('Starting in ' + picard.env.mode + ' mode.')
  sys.puts('Picard boldly goes on port ' + picard.env.port + '...')
}

picard.handle_exception = function(ex, response) {
  sys.puts(ex.message)
  sys.puts(ex.stack)

  var body = ''
  body = '<h3>' + ex.message + '</h3>'
  body += '<pre>' + ex.stack + '</pre>'

  response.sendHeader(200, {"Content-Type": "text/html"});
  response.sendBody(body);
  response.finish();
}


// http.createServer(function (request, response) {
//   
//   var scope = {
//     template: 'test.haml', 
//     print_date: function () {
//       return (new Date()).toDateString();
//     },
//     current_user: {
//       address: "Atlanta, GA",
//       email: "klpresley@gmail.com",
//       bio: "Experienced software professional..."
//     }
//   };
//   
//   Haml.render(scope, scope.template, function(res){  
//     response.sendHeader(200, {"Content-Type": "text/html"});
//     response.sendBody(res);
//     response.finish();
//   });
// 
// }).listen(9900);