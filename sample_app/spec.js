var jasmine = require('jasmine-node/lib/jasmine'), // assumes jasmine is `require`able
    sys = require('sys'),
    http = require('http')

for(var key in jasmine) {
  global[key] = jasmine[key];
}

var isVerbose = false;
var showColors = true;
process.argv.forEach(function(arg){
  switch(arg) {
  case '--color': showColors = true; break;
  case '--noColor': showColors = false; break;
  case '--verbose': isVerbose = true; break;
  }
});

testReq = function(type, path, body, cb){
  var local = http.createClient(9900, 'localhost')
  var request = local.request(type, path)
  
  if(typeof body == 'function')
    cb = body
  else
    request.write(body); 
  
  request.on('response', function (response) {
    var chunks = []
    
    response
      .on('data', function(chunk) { 
        chunks.push(chunk)
      })
      .on('end', function(){
        cb(response.statusCode, response.headers, chunks.join(''))
      })
  }).end()
}

jasmine.executeSpecsInFolder(__dirname + '/spec', function(runner, log){
  process.exit(runner.results().failedCount);
}, isVerbose, showColors);