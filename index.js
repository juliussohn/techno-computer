var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var path = require('path');




app.get('/', function(req, res){
  res.sendfile('www/index.html');
});

app.use(express.static(path.join(__dirname,'www')));


http.listen(process.env.PORT || 5000, function(){
  console.log('listening on *:3000');
});

io.on('connection', function(socket){
  //console.log('a user connected');
});



io.on('connection', function(socket){


  socket.on('play',function(value){
    io.emit('playClient', value);
  });
  socket.on('stop',function(value){
    io.emit('stopClient', value);
  });
  socket.on('changeBPM',function(value){
    console.log('changeBPM', value);
    io.emit('changeBPMClient', value);
  });
  socket.on('changeSequence',function(value){
    io.emit('changeSequenceClient', value);
  });
  socket.on('changeFilter',function(value){
    io.emit('changeFilterClient', value);
  });
  socket.on('changeFilterAmount',function(value){
    io.emit('changeFilterAmountClient', value);
  });
  socket.on('changeArpeggiatorOrientation',function(value){
    io.emit('changeArpeggiatorOrientationClient', value);
  });
  socket.on('connectDevice',function(value){
    io.emit('connectDeviceClient', value);
  });
   socket.on('changeArpeggiatorPower',function(){
    io.emit('changeArpeggiatorPowerClient');
  });

  socket.on('changeArpeggiatorNoteOrder',function(value){
    io.emit('changeArpeggiatorNoteOrderClient',value);
  });
   socket.on('changeOscillatorType',function(value){
    io.emit('changeOscillatorTypeClient',value);
  });





/*
  socket.on('changeSequencer', function(sequence){
     io.emit('changeSequencerDesktop', sequence);
	});
  
  socket.on('changeBPM', function(bpm){
     io.emit('changeBPMDesktop',bpm);
  });

  socket.on('changedDeviceOrienation', function(orientation){
     io.emit('changedDeviceOrienationDesktop',orientation);
  });

   socket.on('changeFilter', function(filter){
     io.emit('changeFilterDesktop',filter);
  });
    socket.on('registerDevice', function(deviceFuntion){
           console.log(deviceFuntion);

     io.emit('registerDeviceDesktop',deviceFuntion);
  });

   */

  



});


 io.emit('play', { for: 'everyone' });
  io.emit('stop', { for: 'everyone' });
  io.emit('changeBPM', { for: 'everyone' });
  io.emit('changeSequence', { for: 'everyone' });
  io.emit('changeFilter', { for: 'everyone' });
  io.emit('changeFilterAmount', { for: 'everyone' });
  io.emit('changeArpeggiatorOrientation', { for: 'everyone' });
  io.emit('connectDevice', { for: 'everyone' });


/*
io.emit('changeFilter', { for: 'everyone' });
io.emit('changeSequencer', { for: 'everyone' });
io.emit('changeBPM', { for: 'everyone' });
io.emit('changedDeviceOrienation', { for: 'everyone' });
io.emit('registerDevice', { for: 'everyone' });
*/

