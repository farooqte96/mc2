var io=require('socket.io-client');
var ip = require('ip');
// import io from 'socket.io-client';
var socket;
socket=io.connect("http://195.148.127.245:3000");
var system_utilization1=null;

// var address,
//     ifaces = require('os').networkInterfaces();
// for (var dev in ifaces) {
//     if(dev ==="eno1") {
//       ifaces[dev].filter((details) => details.family === 'IPv4' && details.internal === false ? address = details.address: undefined);
//     }
//
// }
var address=ip.address();

console.log(address);
var exec=require('child_process').exec;

socket.on('edge.start.req@'+address, (data)=>{
  console.log("listening on consumer");
  // here start consumer container and send response back to server

  var command="./test.sh " + data.consumer_name + " " + '\"'+data.arguments+'\"' + " " + data.image+ " " + data.port+ " " + data.host_port ;
// var command="./test.sh " +data.consumer_name+" " +'\"'+data.image+'\"' + " " + data.port+" "+data.host_port+" "+ JSON.stringify(data.env) ;
  exec(command,function(err, stdout){
      if(err){
        throw err;
        error=" Couldn't start"+data.consumer_name+" with image "+data.image+"& parameters "+data.arguments
        socket.emit('edge.start.res', error);
      }

      // acknowledgement_callback(stdout);
      if(stdout){
        // console.log(stdout);
        var response={"name": data.consumer_name,
                      "image":data.image,
                      "arguments":data.arguments,
                      "PORTS":data.port+":"+data.host_port,
                      "id":address

        }
        // response=data.consumer_name+" with image "+data.image+" started on consumer "+address+" with parameters "+data.arguments+" ports: "+ data.port+ ":" + data.host_port
        socket.emit('edge.start.res', response);
      }

    });








});

// STOP Containers here
socket.on('edge.stop.req@'+address, (name)=>{
  console.log("listening on consumer");
  // here start consumer container and send response back to server

  var command="./stop.sh " + name  ;
// var command="./test.sh " +data.consumer_name+" " +'\"'+data.image+'\"' + " " + data.port+" "+data.host_port+" "+ JSON.stringify(data.env) ;
  exec(command,function(err, stdout){
      if(err){
        throw err;


      }

      // acknowledgement_callback(stdout);
      if(stdout){
        // console.log(stdout);

        var response="Container "+name+" stopped on "+ address;
        socket.emit('edge.stop.res', response);
      }

    });








});


// Experimenting
socket.on('start.req@'+address, (data)=>{
  console.log("listening on consumer");
  // here start consumer container and send response back to server

  var command="./manual.sh " + data.application + " " + '\"'+data.arguments+'\"' + " " + data.image;
// var command="./test.sh " +data.consumer_name+" " +'\"'+data.image+'\"' + " " + data.port+" "+data.host_port+" "+ JSON.stringify(data.env) ;
  exec(command,function(err, stdout){
      if(err){
        throw err;
        error=" Couldn't start"+data.application+" with image "+data.image+"& parameters "+data.arguments
        socket.emit('start.res', error);
      }

      // acknowledgement_callback(stdout);
      if(stdout){
        // console.log(stdout);
        var response={"name": data.application,
                      "image":data.image,
                      "arguments":data.arguments,


        }
        // response=data.consumer_name+" with image "+data.image+" started on consumer "+address+" with parameters "+data.arguments+" ports: "+ data.port+ ":" + data.host_port
        socket.emit('start.res', response);
      }

    });








});












var cpu = require('./test.js');
cpu.add(function(result){

  var system_utilization={};

  system_utilization.cpu=result.cpu;
  system_utilization.gpu=result.gpu;
  system_utilization.ram=40;
  // system_utilization1=system_utilization;
  // console.log(system_utilization.cpu);
  ////

  if (system_utilization){socket.emit('current_load@'+address,system_utilization);}




});
