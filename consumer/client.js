
var io=require('socket.io-client');
// var readlineSync = require('readline-sync');
// import io from 'socket.io-client';
var socket;
socket=io.connect("http://195.148.127.245:3000");
// var mySocket=socket;
var new_user_arrived=true;
var system_utilization1=null;
var exec=require('child_process').exec;
//use cpu data from another file
var cpu = require('./test.js');

// socket.on('testdata', (data, acknowledgement_callback) => {
//   console.log(data)
//   // Do something with `data`
//   // Then call the callback with any result:
//   acknowledgement_callback('Welcome Baby')
//   // This will fire the "acknowledgement_callback" above on server-side
// });


cpu.add(function(result){
  // console.log(result); // this is where you get the return value
  // return location;
  // var io=require('socket.io-client');
  // var socket;
  // socket=io.connect("http://195.148.127.245:3000");

  var system_utilization={};

  system_utilization.cpu=result.cpu;
  system_utilization.gpu=result.gpu;
  system_utilization.ram=40;
  console.log(system_utilization.cpu);
  ////
  system_utilization1=system_utilization

  // console.log(socket);
  // socket.on('cpu_stats', () => {
  //   // console.log('Server requesting cpu_stats event');
  //   console.log(system_utilization);
  //
  // socket.emit('system_utilization',system_utilization);
  //
  //
  // });

  /////

});


socket.on('cpu_stats', () => {
  // console.log('Server requesting cpu_stats event');


      // console.log(system_utilization1);

      socket.emit('system_utilization',system_utilization1);



});

// system_utilization.gpu=30;
// system_utilization.ram=40;

// var exec=require('child_process').exec;
// var env = Object.create(process.env);

//INitialze function which carry user obects
function createUser (username,user_id,app_name){
  this.username=username;
  this.user_id=user_id;
  this.app_name=app_name;
}
var testuser=new createUser("testuser","12345678", "nginx");

  // socket.on('cpu_stats', () => {
  //   console.log('Server requesting cpu_stats event');
  //   console.log(system_utilization);
  //   if(system_utilization.cpu) {
  //     socket.emit('system_utilization',system_utilization);
  //   }
  //
  //
  // });

if (new_user_arrived) {
  socket.emit('user_attach_req', testuser);
  socket.on('response',(response) => {
    if (response.ack==="Verified") {


          console.log("User Identity verified!");


        // console.log("start service for"+testuser.username);

        // var command="echo cXYwU4t2vGGFjvCGCnGK | sudo -S ./test.sh ";
        //
        // exec(command,function(err, stdout){
        //   if(err){
        //   throw err;
        //   }
        //
        // var success=testuser.app_name+" deployed successfully. You can access it ";
        // console.log(success);

      // });
        //Now user wants to leave
        var user_left="yes";
        // var user_left= readlineSync.question('To create user-left event, press yes/no!');

        if (user_left==="yes") {
        console.log("Execute stop script");
        socket.emit("user_left",testuser);
      }


    }
    else {
      console.log("Service Denied to user");
    }
  });
}
// start-event to deploy a container on current Edge Node
socket.on('start@195.148.127.246', (dapp, acknowledgement_callback) => {
  // console.log(dapp);
  console.log("Now we can start the required service");



  var command="./test.sh " + dapp.application + " " + dapp.port + " " + dapp.image+" " + dapp.node;
  exec(command,function(err, stdout){
      if(err){
        throw err;
      }

      acknowledgement_callback(stdout);
    });



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
