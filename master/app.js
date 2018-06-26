var express=require('express');
// var express=require('express.io');
var app=express();
// var routes=require('./routes');
var path=require('path');
var mongoose=require('mongoose');
var bodyParser=require('body-parser');
var socketio=require('socket.io');
mongoose.connect('mongodb://localhost/mec');
const{Observable,BehaviorSubject } =  require('rxjs');



var mySocket = null;
var start_time1=null;
module.exports.start_time1=start_time1;
var end_time1=null;

//initialize app
var app=express();

app.use(bodyParser.json());

app.use(bodyParser.urlencoded({extended:false}));

//Bring in Models
var Cloudlet=require('./models/cloudlet');
var Profile=require('./models/profile');
var Service=require('./models/services');
var Load=require('./models/loads');
var Green=require('./models/green');
var Red=require('./models/red');


var db=mongoose.connection;

//Load Routes from

// app.use('/', routes);

//check connection with db
db.once('open', function(){
  console.log('Connected to db');
});

//check errors on db
db.on('error', function(error){
  console.log(error);
});





//Load view engine  pug
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'pug');

//Set Public Folder for static files
app.use(express.static(path.join(__dirname,'public')));

app.get('/', function(request,response){
  Cloudlet.find({}, function(error, cloudlets){
    if(error) {
      console.log(error);
    }
    else {

      Profile.find({}, function(error, profiles){
          if (profiles) {

              Service.find({},function(error, services){

                if (services) {

                  response.render('index',
                    {
                      title:'Registered Nodes',
                      cloudlets:cloudlets,
                      profiles:profiles,
                      services:services,

                    });

                }

              });


            }


      });


    }
  });




// console.log("hello");
});



app.get('/cloudlets/add', function(request,response){
  response.render('add_cloudlets', {
    title:'Add Cloudlet'
  });
});


//Get single cloudlet
app.get('/cloudlet/:id', function(request, response){
  Cloudlet.findById(request.params.id, function(error, cloudlet){
    response.render('cloudlet',{
      cloudlet:cloudlet
    });
  });
});

//Load Edit form
app.get('/cloudlet/edit/:id', function(request, response){
  Cloudlet.findById(request.params.id, function(error, cloudlet){
    response.render('edit_cloudlet',{
      title:'Edit cloudlet',
      cloudlet:cloudlet
    });
  });
});

//Update Submit
app.post('/cloudlets/edit/:id', function(request, response) {
  var newcloudlet={};
  newcloudlet.name=request.body.name;
  newcloudlet.ip=request.body.ip;
  newcloudlet.network=request.body.network;
  newcloudlet.ssh_key=request.body.ssh_key;
  newcloudlet.role=request.body.role;

  //update cloudlet by id
  var id={_id:request.params.id};

  Cloudlet.update(id,newcloudlet, function(error){
    if (error) {
      console.log(error);
    }
    else {
      response.redirect('/');
    }
  });
});

//delete from database
app.delete('/cloudlet/:id', function(request, response){
  var id={_id:request.params.id};
  Cloudlet.remove(id, function(error){
    if (error){console.log(error);}

    response.send('Successfully deleted');

  });
});
//deploy app

app.get('/deploy', function(request, response){


  Cloudlet.find({}, function(error, cloudlets){
    if(error) {
      console.log(error);
    }
    else {
      response.render('deploy',
      {

        cloudlets:cloudlets

      });
    }
  });
});



//Deplo app post
// var exec=require('child_process').exec;
// var env = Object.create(process.env);
//
// app.post('/deploy', function(request, response){
//
//   var dapp={};
//   dapp.node=request.body.name;
//   dapp.application=request.body.application;
//   dapp.image=request.body.image;
//   dapp.port=request.body.port;
//
//
//   env.arg1=dapp.application;
//   env.arg2=dapp.port;
//   env.arg3=dapp.image;
//   console.log(env.arg1);
//   exec("./test.sh",{env:env},function(err, stdout){
//     if(err){
//       throw err;
//     }
//     console.log(stdout);
//     var success=dapp.application+" deployed successfully. You can access it ";
//     response.render('test',{stdout:stdout, success:success, dapp:dapp});
//   });
// });

//start server
var server=app.listen(3000, function(){


  console.log('server started on port 3000');
  Service.remove({}, function(error, success){
    if (error){throw error;}
    else {
      Load.remove({}, function(error, removed){
        if (error){throw error;}
        else  {
                console.log("Service & Load DB Cleaned");
            }
      });

    }
  });

  Green.remove({}, function(error, removed){

    if (removed)  {
            console.log("Green DB Flushed");
        }
  });
  Red.remove({}, function(error, removed){

    if (removed)  {
            console.log("Red DB Flushed");
        }
  });


});

//Pass server instance i.e. server object to socket.io engine
var io=socketio(server);
module.exports.io = io;
require('./config.js')(io);


// app.set('socketio', io);
//Deploy remote\

var x=require('./config.js');
// console.log('assigning subject');
var subject=x.subject;
var subject1=x.subject1;
var subject2=x.subject2;
// subject.subscribe(res => {
//
//     if(res){
//       console.log(res);
//       //var success=res.name+" deployed successfully. You can access it ";
//       //console.log(success);
//
//       // response.render('deploy_post',{success:success, dapp:dapp});
//     }
// })
var Rx = require('rxjs');
const { switchMap } = require('rxjs/operators');

var deploySubject = new Rx.Subject();
var migrateSubject = new Rx.Subject();
var resGlobal = null;
var migGlobal = null;
var redeploySubject = new Rx.Subject();
var redeployGlobal = null;
// ///////////////
redeploySubject
.pipe(
  switchMap(deployRes1 => {
    //Step 5: assign resquest, response and dapp values to global for future use
    redeployGlobal = deployRes1;
    // Step 6: wait for subject to emit the event
    return subject2;
  })
).subscribe(subjectResponse=> {
  // Step 7: subject event emitted
  // console.log(JSON.stringify(resGlobal.dapp));
  end_time1=new Date();
  var time= end_time1.getTime()-start_time1.getTime();
    console.log("Re-creation Time: "+ (end_time1.getTime()-start_time1.getTime() ));
  var success=redeployGlobal.mag.application+" re-deployed successfully. You can access it ";
  // Step 8: send the required response to form to show to the UI
  return redeployGlobal.response.render('deploy_post',{stdout:subjectResponse, success:success, dapp:redeployGlobal.mag,time:time});
})



/////////////////////
// Step 4: subscribe to events (Both deploySubject and subject sequentially)
deploySubject
.pipe(
  switchMap(deployRes => {
    //Step 5: assign resquest, response and dapp values to global for future use
    resGlobal = deployRes;
    // Step 6: wait for subject to emit the event
    return subject;
  })
).subscribe(subjectResponse=> {
  // Step 7: subject event emitted
  // console.log(JSON.stringify(resGlobal.dapp));
  end_time1=new Date();
  var time= end_time1.getTime()-start_time1.getTime();
  if (subjectResponse.error){
    var result=resGlobal.dapp.name+" deployment failed due to error "+JSON.stringify(subjectResponse.error);
  }
  else {
    var result=resGlobal.dapp.name+" deployed successfully.";
  }

  // save service for all + only when there is no error:
  if (!subjectResponse.error){

    resGlobal.service.save(function(error, savedservice){
      if (error){
        console.log(error);
      }
      else {
        console.log('service saved successfully');
        // response.redirect('/');
      }
    });

  }

  // Step 8: send the required response to form to show to the UI
  return resGlobal.response.render('deploy_post',{stdout:JSON.stringify(subjectResponse), result:result, dapp:resGlobal.dapp,time:time});
})

//migrateSubject HERE
// Step 4: subscribe to events (Both deploySubject and subject sequentially)
migrateSubject
.pipe(
  switchMap(migrateRes => {
    //Step 5: assign resquest, response and mag values to migGlobal for future use
    migGlobal = migrateRes;
    // Step 6: wait for subject to emit the event
    return subject1;
  })
).subscribe(subjectResponse=> {
  // Step 7: subject event emitted
  // console.log(JSON.stringify(migGlobal.mag));
  // var success=mag.application+" migrated successfully.";
  // response.render('migrate_post',{stdout:stdout, success:success, mag:mag});
  if (subjectResponse.error){
    var success=migGlobal.mag.application+" migration failed due to error "+JSON.stringify(subjectResponse.error);
  }
  else {
    var success=migGlobal.mag.application+" migrated successfully.";
  }

  // Step 8: send the required response to form to show to the UI
  end_time1=new Date();
  var time= end_time1.getTime()-start_time1.getTime();
    console.log("Migration Time: "+ (end_time1.getTime()-start_time1.getTime() ));
  return migGlobal.response.render('migrate_post',{stdout:subjectResponse, success:success, mag:migGlobal.mag, time:time});
})

// Step 1: click on deployed
app.post('/deploy', function(request, response){

  var dapp={};
  dapp.node=request.body.name;
  //separate ip from node name;
  var sep=dapp.node.split('@');
  dapp.ip=sep[1];
  dapp.name=request.body.application;
  dapp.image=request.body.image;
  dapp.arguments=request.body.arguments;
  dapp.browser=true;
  var node=request.body.name;
  dapp.type=request.body.type;
  dapp.restart=false;


  var service=new Service();
  service.name=dapp.ip;
  service.app=dapp.name;
  service.image=dapp.image;
  service.arguments=dapp.arguments;
  service.type=dapp.type;
  console.log("Arguments: "+service.arguments);


  // Experimentation
  Cloudlet.find({"ip":dapp.ip}, function(error, cloudlets){
    if(error) {
      console.log(error);
    }
    else {
              if (cloudlets.length == 1)  {

                        dapp.role=cloudlets[0].role;


                        }
          console.log("Hi "+dapp.ip+"has role "+dapp.role);
          // Query Load info if role is consumer
          if (dapp.role==="consumer") {
              // show its load info.
              Load.find({"address":dapp.ip}, function(error, loads){
                          if (loads.length ==1 && loads[0].cpu <= 90 && loads[0].gpu <= 90 && loads[0].ram <=90) {
                          // // save service for only consumers:
                          // service.save(function(error, savedservice){
                          //   if (error){
                          //     console.log(error);
                          //   }
                          //   else {
                          //     console.log('service saved successfully');
                          //     // response.redirect('/');
                          //   }
                          // });

                          // console.log("Current Load: "+loads[0]);
                          start_time1=new Date();


                          io.emit("start.req@"+ dapp.ip, dapp)
                          return deploySubject.next({request,response,dapp,service});
                          }
                          else {

                            var sorry="Destination Node "+dapp.ip+ " is Overloaded! \n Current load: cpu: "+loads[0].cpu+" gpu: "+loads[0].gpu+" ram: "+loads[0].ram;
                            // Step 8: send the required response to form to show to the UI
                            response.render('migrate_post',{success:sorry});
                            }
                      });
                    }
          else{
            start_time1=new Date();


            // console.log("Now we are not consumer!")
            io.emit("start.req@"+ dapp.ip, dapp)
            return deploySubject.next({request,response,dapp,service});
          }

    }
  });



    // Step2: send to remote device using socket
    // io.emit("start.req@"+ dapp.ip, dapp)

    // Step 3: emit to subject required parameters
    // return deploySubject.next({request,response,dapp});

    //   mySocket.emit("start@"+ dapp.ip+"", dapp, function acknowledgement_callback (result) {
    //     console.log(result);
    //     var success=dapp.application+" deployed successfully. You can access it ";
    //     response.render('deploy_post',{stdout:result, success:success, dapp:dapp});
    // });
      // if (mySocket){
        //console.log(mySocket.handshake.address.split("ff:"))
    //
    // subject.toPromise().then(res => {
    //   console.log('from promise');
    //   console.log(res);
    //   var success=dapp.application+" deployed successfully. You can access it ";
    //   response.render('deploy_post',{stdout:res, success:success, dapp:dapp});
    // })

  // }



    // var exec=require('child_process').exec;
    // // var env = Object.create(process.env);
    // var command="./test.sh " + dapp.application + " " + '\"'+dapp.arguments+'\"' + " " + dapp.image+" " + dapp.node;
    // exec(command,function(err, stdout){
    //     if(err){
    //       throw err;
    //     }
    //     console.log(stdout);
    //
    //     var success=dapp.application+" deployed successfully. You can access it ";
    //     response.render('deploy_post',{stdout:stdout, success:success, dapp:dapp});
    //
    //
    //
    //
    //   });




});






app.post('/cloudlets/add', function(request, response) {
  var cloudlet=new Cloudlet();
  cloudlet.name=request.body.name;
  cloudlet.ip=request.body.ip;
  cloudlet.network=request.body.network;
  cloudlet.ssh_key=request.body.ssh_key;
  cloudlet.role=request.body.role;
  cloudlet.save(function(error, savedcloudlet){
    if (error){
      console.log(error);
    }
    else {
      console.log('cloudlet Added successfully');
      response.redirect('/');
    }
  });
});


///GET MIGRATE

app.get('/migrate', function(request, response){
  // mySocket.emit('testdata',"Hello World");
  // console.log("we are  on migrate route");
  // // console.log(mySocket);
  // mySocket.on('testback',(testback) =>{
  //   console.log(testback);
  // });


      // response.status(200).send("Hello World");
  Cloudlet.find({}, function(error, cloudlets){
    if(error) {
      console.log(error);
    }
    else {

      Service.find({}, function(error, services){

          response.render('migrate',
        {

          cloudlets:cloudlets,
          services:services

        });

      });

    }
  });
});


app.post('/migrate', function(request, response){
  var mag={};
  mag.application=request.body.application;
  mag.name=request.body.application;
  mag.source=request.body.source;
  mag.destination0=request.body.destination;
  mag.destination=mag.destination0.split('@')[1];
  var sep=mag.source.split('@');
  // var sep1=mag.destination.split('@');
  mag.ip=sep[1];
  // mag.dstip=sep1[1];
  mag.browser=true;


  Cloudlet.find({"role":"cloud"}, function(error,cloudlets){

    Service.find({"app":mag.application}, function(error, services){
      if(error) {
        console.log(error);
      }
      else {
              if (services.length == 1){

                  mag.id=services[0]._id;
                  mag.image=services[0].image;
                  mag.arguments=services[0].arguments;
                  mag.type=services[0].type;

                  }

                  // var success=mag.application+" migrated successfully.";
                  // response.render('migrate_post',{stdout:stdout, success:success, mag:mag});

                  // Dont check load info when destination is cloud
                  if (mag.destination==cloudlets[0].ip) {

                    var newservice={};
                    // new name of node
                    newservice.name=mag.destination;
                    var id={_id:mag.id};
                    Service.update(id, newservice, function(error){
                      if (error){throw error}
                      else {console.log("Service name updated!")}
                    });


                    start_time1=new Date();
                    // Migrate if stateful otherwise kill and restrat
                          if(mag.type==="stateless") {
                                  io.emit("stop.req@"+mag.ip,mag.application);
                                  mag.restart=true;
                                  io.emit("start.req@"+mag.destination,mag);
                                  return redeploySubject.next({request,response,mag});
                            }
                            else {
                              io.emit("mig.req@"+ mag.ip, mag)
                              return migrateSubject.next({request,response,mag});
                                }


                  }
                  else {

                    Load.find({"address": mag.destination}, function(error, loads){
                                if (loads.length ==1 && loads[0].cpu <= 80 && loads[0].gpu <= 80 && loads[0].ram <=80) {
                                // Update service for only consumers:
                                var newservice={};
                                // new name of node
                                newservice.name=mag.destination;
                                var id={_id:mag.id};
                                Service.update(id, newservice, function(error){
                                  if (error){throw error}
                                  else {console.log("Service name updated!")}
                                });

                                console.log("Current Load on Destination Node: "+loads[0]);
                                start_time1=new Date();
                                // Migrate if stateful otherwise kill and restrat
                                      if(mag.type==="stateless") {
                                              io.emit("stop.req@"+mag.ip,mag.application);
                                              mag.restart=true;
                                              io.emit("start.req@"+mag.destination,mag);
                                              return redeploySubject.next({request,response,mag});
                                        }
                                        else {
                                          io.emit("mig.req@"+ mag.ip, mag)
                                          return migrateSubject.next({request,response,mag});
                                            }

                                }
                                else {

                                  var sorry="Destination Node "+mag.destination+ " is Overloaded! \n Current load: cpu: "+loads[0].cpu+" gpu: "+loads[0].gpu+" ram: "+loads[0].ram;
                                  // Step 8: send the required response to form to show to the UI
                                  response.render('migrate_post',{success:sorry});
                                  }
                            });
                  }
                  // NEW Experimentation


                  // io.emit("mig.req@"+ mag.ip, mag)
                  //
                  // // Step 3: emit to subject required parameters
                  // return migrateSubject.next({request,response,mag});


      }
    });

  });







  // mySocket.emit("migrate_source@"+ mag.ip+"", mag, function acknowledgement_callback (result) {
  //   console.log(result);
  //   var success=mag.application+" migrated successfully.";
  //   response.render('migrate_post',{stdout:result, success:success, mag:mag});
  //
  //
  //
  // });







});
// Now here we add application profiling Routes
app.get('/profiles/add', function(request,response){
  response.render('add_profiles', {
    title:'Add Profile'
  });
});


//Get single profile
app.get('/profile/:id', function(request, response){
  Profile.findById(request.params.id, function(error, profile){
    response.render('profile',{
      profile:profile
    });
  });
});



//Load Edit form
app.get('/profile/edit/:id', function(request, response){
  Profile.findById(request.params.id, function(error, profile){
    response.render('edit_profile',{
      title:'Edit Profile',
      profile:profile
    });
  });
});

//Update Submit
app.post('/profiles/edit/:id', function(request, response) {
  var newprofile={};
  newprofile.name=request.body.name;
  newprofile.image=request.body.image;
  newprofile.cpu=request.body.cpu;
  newprofile.gpu=request.body.gpu;
  newprofile.ram=request.body.ram;


  //update profile by id
  var id={_id:request.params.id};

  Profile.update(id,newprofile, function(error){
    if (error) {
      console.log(error);
    }
    else {
      response.redirect('/');
    }
  });
});

app.post('/profiles/add', function(request, response) {
  var profile=new Profile();
  profile.name=request.body.name;
  profile.image=request.body.image;
  profile.cpu=request.body.cpu;
  profile.gpu=request.body.gpu;
  profile.ram=request.body.ram;
  profile.save(function(error, savedprofile){
    if (error){
      console.log(error);
    }
    else {
      console.log('Profile saved successfully');
      response.redirect('/');
    }
  });
});


//delete profile from database
app.delete('/profile/:id', function(request, response){
  var id={_id:request.params.id};
  Profile.remove(id, function(error){
    if (error){console.log(error);}

    response.send('Profile successfully removed');

  });
});

//Get single service
app.get('/service/:id', function(request, response){
  Service.findById(request.params.id, function(error, service){
    response.render('service',{
      service:service
    });
  });
});


//delete service from database
app.delete('/service/:id', function(request, response){
  var id={_id:request.params.id};
  Service.find({"_id":id}, function(error, services){
    var mag2={};
    mag2.ip=services[0].name;
    mag2.application=services[0].app;
    io.emit("stop.req@"+mag2.ip,mag2.application);
    Service.remove(id, function(error){
      if (error){console.log(error);}



      response.send('Service successfully removed');

    });


  });

});

// var node1_system={"cpu":"100%", "gpu":"20%", "memory":"40%"};
// var node2_system={"cpu":"100%", "gpu":"40%", "memory":"60%"};
// var stringify = require('stringify');
// var node1_system = JSON.stringify(node1_system);
// var system_utilization=node1_system;
// var new_event="user has arrived";
////connec to multiple servers

// var config=require('./config.js');
// var redis=require('socket.io-redis');
// io.adapter(redis(redisConfig));

// //search function
//
// function search(user_id,app, array){
//     for (var i=0; i < array.length; i++) {
//         if ( (array[i].app_name === app) && (array[i].user_id === user_id) ) {
//             var reply="App supported and User Found! attach this";
//             return reply
//         }
//     }
// }
// //Applictions supported
// var users_db=[{ username: 'testuser', user_id: '12345678', app_name: 'nginx' }];
//Create Root Namespace
// var sockets=require('./socket.js');
// var root=io.of('/');  //getting root url and bind it to root namespace
// root.on('connection', sockets.rootNamespace);  //binding namespace to connection event
//io.on listens for event connection, pass socket connection to callback
//canbe used to send data to client. i.e browser.
// io.on('connection', socket => {
//   console.log('A socket is opened by client: '+socket.handshake.address.split("ff:")[1]);
//   // console.log(socket);
//   socket.emit('cpu_stats');
//   mySocket = socket;
//
//   socket.on('system_utilization', (system_utilization) => {
//     // console.log(system_utilization);
//     // system_utilization=JSON.stringify(system_utilization);
//     io.emit('sendtobrowser', system_utilization);
//     setTimeout(()=> socket.emit('cpu_stats'),2000);
//
//     });
//
//     ///this request comes from browser or edge node
//   socket.on('user_attach_req', (user) => {
//     var ip=socket.handshake.address.split("ff:");
//     user.ip=ip[1];
//
//     console.log('attach request received');
//     io.emit('user_attach_req_browser',user);
//     if (search(user.user_id,user.app_name,  users_db)) {
//       user.ack="Verified"
//     io.emit('response',user);
//       // io.emit('user_attach_rep_browser',user);
//     }
//     else {
//       socket.emit('response',"NACK");
//       console.log(user_attach_req.app_name);
//     }
//
//   });
//
//   socket.on("user_left", (user)=> {
//      console.log("User left message received");
//      //send also to browser
//     io.emit("user_left", user);
//
//   });
//   // testing here
//   // socket.emit('testdata',"Hello World");
//   //
//   // // console.log(mySocket);
//   // socket.on('testback',(testback) =>{
//   //   console.log(testback);
//   // });
//
// });
