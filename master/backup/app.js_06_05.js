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


//initialize app
var app=express();

app.use(bodyParser.json());

app.use(bodyParser.urlencoded({extended:false}));

//Bring in Models
var Cloudlet=require('./models/cloudlet');
var Service=require('./models/services');


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

      response.render('index',
      {
        title:'Registered Nodes',
        cloudlets:cloudlets

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
      console.log("Service DB Cleaned");
    }
  });

});

//Pass server instance i.e. server object to socket.io engine
var io=socketio(server);

require('./config.js')(io);


// app.set('socketio', io);
//Deploy remote\

var x=require('./config.js');
console.log('assigning subject');
var subject=x.subject;
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
var resGlobal = null;
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
  console.log(JSON.stringify(resGlobal.dapp));
  var success=resGlobal.dapp.name+" deployed successfully. You can access it ";
  // Step 8: send the required response to form to show to the UI
  return resGlobal.response.render('deploy_post',{stdout:subjectResponse, success:success, dapp:resGlobal.dapp});
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
  var node=request.body.name;
  console.log(dapp.node);

  var service=new Service();
  service.name=dapp.node;
  service.app=dapp.name;
  service.image=dapp.image;
  service.arguments=dapp.arguments;
  console.log("Arguments: "+service.arguments);
  service.save(function(error, savedservice){
    if (error){
      console.log(error);
    }
    else {
      console.log('service saved successfully');
      // response.redirect('/');
    }
  });

    // Step2: send to remote device using socket
    io.emit("start.req@"+ dapp.ip, dapp)

    // Step 3: emit to subject required parameters
    return deploySubject.next({request,response,dapp});

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
  mag.source=request.body.source;
  mag.destination=request.body.destination;
  var sep=mag.source.split('@');
  mag.ip=sep[1];




  Service.find({"app":mag.application}, function(error, services){
    if(error) {
      console.log(error);
    }
    else {
            if (services.length == 1){
              mag.id=services[0]._id;
              mag.image=services[0].image;
              mag.arguments=services[0].arguments;
            }



      var exec=require('child_process').exec;

      var command="./pre_migrate.sh " + mag.source + " " + mag.application + " " + mag.image+" " + '\"'+mag.arguments+'\"' + " " + mag.destination;
      exec(command,function(err, stdout){
          if(err){
            throw err;
          }
          console.log(stdout);
          var success=mag.application+" migrated successfully.";
          response.render('migrate_post',{stdout:stdout, success:success, mag:mag});
          var newservice={};
          // new name of node
          newservice.name=mag.destination;
          var id={_id:mag.id};
          Service.update(id, newservice, function(error){
            if (error){throw error}
            else {console.log("Service name updated!")}
          });
        });
    }
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
