var Picard = require('../../lib/picard').start()

// Picard doesn't handle multipart form upload by default,
// so you'll have to pull in your own library if you need it:

var formidable = require('formidable') // see https://github.com/felixge/node-formidable
var sys = require('sys')

Picard.post('/upload', function(request){
  var form = new formidable.IncomingForm()
  
  form
    .on('field', function(field, value) { request[field] = value })
    .on('file', function(field, file) { request[field] = file })
    .on('error', function(err){ request.handleException(err) })
    .on('end', function(){ 
      request.onScreen(
        'Title field: ' + request.title + '<br />' +
        'Uploaded file: ' + sys.inspect(request.upload)
      ) 
    })
    .parse(request)
})

Picard.get('/', function(){
  return '<form action="/upload" enctype="multipart/form-data" method="post">'+
  '<input type="text" name="title"><br>'+
  '<input type="file" name="upload" multiple="multiple"><br>'+
  '<input type="submit" value="Upload">'+
  '</form>'
})