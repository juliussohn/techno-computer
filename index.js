var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var path = require('path');
//var client = redis.createClient()

//console.log(client)

var clients = {};


app.use("/js", express.static(__dirname + "/www/js"));
app.use("/img", express.static(__dirname + "/www/img"));
app.use("/css", express.static(__dirname + "/www/css"));
app.use("/templates", express.static(__dirname + "/www/templates"));
app.use("/fonts", express.static(__dirname + "/www/fonts"));
app.use("/samples", express.static(__dirname + "/www/samples"));


app.get('/*', function(req, res) { 
  res.sendFile(__dirname + '/www/index.html')
});


app.use(express.static(path.join(__dirname,'www')));


http.listen(process.env.PORT || 5000, function(){
  console.log('listening on *:5000');
});

io.on('connection', function(socket){
  //console.log(socket);
});

var monitors = {};

io.on('connection', function(socket){
  var id = makeid();
  socket.join(id);
  io.to(id).emit('clientToken',id);
 // console.log(id, "connected");

  socket.on('login',function(token){
   // console.log(socket.rooms,token);


    //var roster = io.sockets.clients(token);
    if(io.sockets.adapter.rooms[token]){
      socket.join(token);
      io.to(token).emit('loginSuccessfulClient');
    }else{
      socket.emit('loginFailedClient');
    }



    
    
  });




  socket.on('play',function(value){
    console.log(value.token, "play")
    console.log(id, "play");

    io.to(value.token).emit('playClient', value.value);
  });
  socket.on('stop',function(value){
    io.to(value.token).emit('stopClient', value.value);
    clients[value.token].emit('stopClient', value.value);
  });
  socket.on('changeBPM',function(value){
    console.log('changeBPM', value);
    io.to(value.token).emit('changeBPMClient', value.value);
  });
  socket.on('changeSequence',function(value){
    io.to(value.token).emit('changeSequenceClient', value.value);
  });
  socket.on('changeFilter',function(value){
    io.to(value.token).emit('changeFilterClient', value.value);
  });
  socket.on('changeFilterAmount',function(value){
    io.to(value.token).emit('changeFilterAmountClient', value.value);
  });
  socket.on('changeArpeggiatorOrientation',function(value){
    io.to(value.token).emit('changeArpeggiatorOrientationClient', value.value);
  });

  socket.on('connectDevice',function(value){
    console.log(value);
    io.to(value.token).emit('connectDeviceClient', value.value);
  });

   socket.on('changeArpeggiatorPower',function(value){
    io.to(value.token).emit('changeArpeggiatorPowerClient');
  });

  socket.on('changeArpeggiatorNoteOrder',function(value){
    io.to(value.token).emit('changeArpeggiatorNoteOrderClient',value.value);
  });
   socket.on('changeOscillatorType',function(value){
    io.to(value.token).emit('changeOscillatorTypeClient',value.value);
  });





/*
  socket.on('changeSequencer', function(sequence){
     socket.emit('changeSequencerDesktop', sequence);
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



function makeid()
{
    var text = "";
    var possible = "0123456789";

    for( var i=0; i < 4; i++ )
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
}
