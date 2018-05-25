
var io=require('socket.io-client');
// var readlineSync = require('readline-sync');
// import io from 'socket.io-client';
var socket;
socket=io.connect("http://127.0.0.1:3000");
var exec=require('child_process').exec;

// start-event to deploy a container on current Edge Node
socket.on('start@localhost1', (producer) => {
  // console.log(dapp);
  console.log("Now we can start the producer2 service here");



  var command="./test.sh " + producer.app + " " + producer.port + " " + producer.image+" " + producer.destn_node;
  exec(command,function(err, stdout){
      if(err){
        throw err;
      }

      // acknowledgement_callback(stdout);
      socket.emit("status", stdout);
    });



});

socket.on("hello", (hello)=>{
  console.log(hello);
});

socket.on('migrate_source@195.148.127.246', (mag, acknowledgement_callback) => {
  // console.log(dapp);
  console.log("Now we are migrating "+ mag.application);



  var command="./migrate2.sh " + mag.application + " " + mag.image + " " + mag.port+" " + mag.destination;
  exec(command,function(err, stdout){
      if(err){
        throw err;
      }

      acknowledgement_callback(stdout);
    });



});
