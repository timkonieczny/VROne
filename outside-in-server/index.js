var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

io.on('connection', function(socket){
  socket.on("position", function(pos){
    console.log(pos);
    io.emit('position', pos);
  })
});

http.listen(3000, function(){
  console.log('listening on *:3000');
});
