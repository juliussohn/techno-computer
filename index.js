var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var path = require('path');




app.get('/', function(req, res){
  res.sendfile('www/index.html');
});

app.use(express.static(path.join(__dirname,'www')));


http.listen(3000, function(){
  console.log('listening on *:3000');
});

io.on('connection', function(socket){
  console.log('a user connected');
});



io.on('connection', function(socket){

  socket.on('record', function(msg){
     io.emit('record', msg);
	});
    socket.on('stopRecording', function(){
     io.emit('stopRecordingClient');
  });

    socket.on('startRecording', function(){
     io.emit('startRecordingClient');
  });



});



io.emit('record', { for: 'everyone' });

