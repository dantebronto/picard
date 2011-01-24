var jasmine = require('jasmine-node/lib/jasmine'),
    spawn = require('child_process').spawn,
    util = require('util'),
    http = require('http'),
    sys = require('sys')
    
for(var key in jasmine)
  global[key] = jasmine[key]

global.testReq = function(type, path, body, cb){
  var local = http.createClient(9900, 'localhost')
  var request = local.request(type, path)
  
  if( typeof body == 'function' )
    cb = body
  else
    request.write(body)
  
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

var SpecRunner = {
  run: function(){
    var self = this
    spawn('ls', ['-1', __dirname + '/spec']).stdout.on('data', function(res){
      self.allSpecs = res.toString().split("\n")
      SpecRunner.runSpecsFor(self.allSpecs.shift(), self.nextSpec)
    })
  },
  nextSpec: function(){
    var spec = SpecRunner.allSpecs.shift()
    if ( typeof spec != 'undefined' && spec != '' )
      SpecRunner.runSpecsFor(spec, SpecRunner.nextSpec)
  },
  runSpecsFor: function(appName, cb){
    var app, cmd = 'node', ext = 'js'

    if ( /coffee/.test(appName) )
      ext = cmd = 'coffee'

    app = spawn(cmd, [__dirname + '/examples/' + appName + '/app' + '.' + ext])

    app.stdout.on('data', function(data){
      data = data.toString()
      var spec = __dirname + '/spec/' + appName

      if ( /Picard boldly goes/.test(data) )
        jasmine.executeSpecsInFolder(spec, function(runner, log){
          app.kill('SIGHUP')
        }, false, true)
      else
        util.print("\n" + data.replace("\n", '') + " ")
    })

    app.stderr.on('data', function(data){
      sys.puts('fuck!')
      sys.puts(data.toString())
    })

    app.on('exit', cb)
  }
}

SpecRunner.run()