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


  socket.on('changeSequencer', function(sequence){
    console.log("changeSequencer")
     io.emit('changeSequencerDesktop', sequence);
	});
  
  socket.on('changeBPM', function(bpm){
     io.emit('changeBPMDesktop',bpm);
  });

  socket.on('changedDeviceOrienation', function(orientation){
      console.log("changedDeviceOrienation")
     io.emit('changedDeviceOrienationDesktop',orientation);
  });

   socket.on('changeFilter', function(filter){
     io.emit('changeFilterDesktop',filter);
  });

   

   



});



io.emit('changeFilter', { for: 'everyone' });
io.emit('changeSequencer', { for: 'everyone' });
io.emit('changeBPM', { for: 'everyone' });
io.emit('changedDeviceOrienation', { for: 'everyone' });

