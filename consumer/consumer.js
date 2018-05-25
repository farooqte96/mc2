var io=require('socket.io-client');
var ip = require('ip');
// import io from 'socket.io-client';
var socket;
socket=io.connect("http://195.148.127.246:3000");
var system_utilization1=null;
var myrole=null;


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

socket.on("set.role@"+address, (data)=>{
  console.log("I am"+data.role);
  if (data.role==="consumer") {
    consumer(data.network);
  }

});

// Execute everything when we get our role defined from server


  socket.on('start.req@'+address, (data)=>{

    // here start consumer container and send response back to server

    var command="./test.sh " + data.name + " " + '\"'+data.arguments+'\"' + " " + data.image;
  // var command="./test.sh " +data.consumer_name+" " +'\"'+data.image+'\"' + " " + data.port+" "+data.host_port+" "+ JSON.stringify(data.env) ;
    exec(command,function(err, stdout){
        if(err){
          throw err;
          error=" Couldn't start"+data.name+" with image "+data.image+"& parameters "+data.arguments
          socket.emit('edge.start.res', error);
        }

        // acknowledgement_callback(stdout);
        if(stdout){
          // console.log(stdout);
          var response={"name": data.name,
                        "image":data.image,
                        "arguments":data.arguments,
                        "id":address,
                        "bflag":data.browser,
                        "restart":data.restart

          }
          if (data.restart) {
                var response2={"From":data.ip,
                          "To":data.destination,
                          "name": data.application,
                          "image":data.image,
                          "arguments":data.arguments,
                          "bflag":data.browser,
                          "restart":data.restart

                        }
            // emit migrate event because we have restarted container
            socket.emit('mig.res', response2);
          }
          // response=data.consumer_name+" with image "+data.image+" started on consumer "+address+" with parameters "+data.arguments+" ports: "+ data.port+ ":" + data.host_port
          socket.emit('start.res', response);
        }

      });








  });

  // STOP Containers here
  socket.on('stop.req@'+address, (name)=>{
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
          socket.emit('stop.res', response);
        }

      });








  });




  //Migrate containers

// Only for consumer
function consumer(network){


  contLoad(network);
  socket.on('mig.req@'+address, (mag)=>{
    console.log("listening for migration");
    // here start consumer container and send response back to server

    var command="./migrate2.sh " + mag.application +  " " + mag.image+" " + '\"'+mag.arguments+'\"' + " " + mag.destination;
  // var command="./test.sh " +data.consumer_name+" " +'\"'+data.image+'\"' + " " + data.port+" "+data.host_port+" "+ JSON.stringify(data.env) ;
    exec(command,function(err, stdout){
        if(err){
          throw err;
          error=" Couldn't migrate "+mag.application

        }

        // acknowledgement_callback(stdout);
        if(stdout){
          // console.log(stdout);
          var response={"From":address,
                        "To":mag.destination,
                        "name": mag.application,
                        "image":mag.image,
                        "arguments":mag.arguments,
                        "bflag":mag.browser

          }
          // response=data.consumer_name+" with image "+data.image+" started on consumer "+address+" with parameters "+data.arguments+" ports: "+ data.port+ ":" + data.host_port
          socket.emit('mig.res', response);
        }

      });








  });

}















  var cpu = require('./test.js');

  // contLoad for getting load values after every 7 sec

  function contLoad(network){

    cpu.cont(function(result){

      var system_utilization={};

      system_utilization.cpu=result.cpu;
      system_utilization.gpu=result.gpu;
      system_utilization.ram=0;
      system_utilization.address=address;
      system_utilization.network=network;

  // system_utilization.cpu >=80 || system_utilization.gpu >=80 || system_utilization.ram >= 80
      // system_utilization1=system_utilization;


        console.log(system_utilization);
        socket.emit('send.load', system_utilization);

      ////

      // if (system_utilization){socket.emit('current_load@'+address,system_utilization);}




    });

    // console.log(counter);
    setTimeout(contLoad, 7000,network);
  }
