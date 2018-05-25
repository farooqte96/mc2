var io=require('socket.io-client');
// import io from 'socket.io-client';
var socket;
socket=io.connect("http://127.0.0.1:3000");


function sendata (destn_node,app,image,port){
  this.destn_node=destn_node;
  this.app=app;
  this.image=image;
  this.arguments =arguments;
}

// var consumer1=new sendata("195.148.127.246","docker-alpha", "nginx", "-p 80:80");
var producer1=new sendata("195.148.127.246","docker-alpha", "nginx", "-p 80:80");
var producer2=new sendata("localhost1","docker-alpha", "nginx", "-p 80:80");
var data={};
// var consumer_all=[consumer1];
var producer_all=[producer1,producer2];
data.consumer=consumer_all;
data.producer=producer_all;



// socket.emit('start_containers', data, function response_callback (result) {
//
// console.log(result);
//
// });
socket.emit('start_containers', "here data comes");
