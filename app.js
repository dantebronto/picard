require('./config/env')

http.createServer(function (request, response) {
  var scope = {
    template: 'test.haml', 
    print_date: function () {
      return (new Date()).toDateString();
    },
    current_user: {
      address: "Atlanta, GA",
      email: "klpresley@gmail.com",
      bio: "Experienced software professional..."
    }
  };

  Haml.render(scope, scope.template, function(res){   
    response.sendHeader(200, {"Content-Type": "text/html"});
    response.sendBody(res);
    response.finish();
  });

}).listen(8000);

sys.puts("Server running at http://127.0.0.1:8000/")
