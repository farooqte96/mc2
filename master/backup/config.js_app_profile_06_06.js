var Cloudlet=require('./models/cloudlet');
var Load=require('./models/loads');
var Service=require('./models/services');
var Green=require('./models/green');
var Red=require('./models/red');
var Sum=require('sum-of-two-numbers');
var Profile=require('./models/profile');
var start_time=null;
var end_time=null;
const{Observable,BehaviorSubject,Subject } =  require('rxjs');

// var subject = new BehaviorSubject(null);
// subject for deploy and subject1 for migrate.
var z=require('./app.js');
// console.log('assigning subject');
var x_io=z.io;
var start_time1=z.start_time1;
if(z.start_time1) {console.log(start_time1.getTime());}
var subject = new Subject(null);
var subject1= new Subject(null);
var subject2= new Subject(null);
// var greencheck=0;
var redcheck=0;
//check cpu info on all consumers & filter them into green and red nodes

function currentStats(){

  // console.log("Greencheck At the start"+greencheck);
  // redcheck to filter out previous simulation loads values
  if(redcheck==0) {Load.remove({}, function(error, removed){
                if (removed) {console.log("Previous values cleared!");}
            });}


  Cloudlet.find({"role":"consumer"}, function(error, cloudlets){
        if(error)   {
              console.log(error);
              }
        else {
                    for (var i=0; i<cloudlets.length;i++){

                      // console.log(cloudlets[i].ip);
                      Load.find({"address":cloudlets[i].ip}, function(error, loads){
                                if (error){throw error}
                                else  {
                                          // loads.length ==1 && loads[0].cpu <= 10 && loads[0].gpu <= 10 && loads[0].ram <=10
                                        if (loads.length ==1 && loads[0].cpu <= 40 ) {
                                                          // Needs to check if that load already saved in red
                                                          Red.find({"address":loads[0].address}, function(error, reds){
                                                            if (reds.length >=1) {
                                                                                Red.remove({"address":loads[0].address}, function(error, removed){
                                                                                  if (removed) {console.log ("Previous Red value Dumped!")}
                                                                                });
                                                                                }
                                                          });
                                                          // first check if load.address belongs to green. If not save that otherwise update

                                                          Green.find({"address":loads[0].address}, function(error, greens){
                                                            if (greens.length==1) {
                                                                                      // update
                                                                                var green_id=greens[0]._id;
                                                                                var newgreen={};
                                                                                newgreen.cpu=loads[0].cpu;
                                                                                newgreen.gpu=loads[0].gpu;
                                                                                newgreen.ram=loads[0].ram;
                                                                                newgreen.total=loads[0].total;
                                                                                var id={_id:green_id};
                                                                                Green.update(id, newgreen, function(error){
                                                                                    if (error){throw error}
                                                                                    else {console.log("Green info updated")}
                                                                                    });

                                                                                }





                                                            else                {
                                                                                    // save

                                                                                    var green=new Green();
                                                                                    green.address=loads[0].address;
                                                                                    green.network=loads[0].network;
                                                                                    green.cpu=loads[0].cpu;
                                                                                    green.gpu=loads[0].gpu;
                                                                                    green.ram=loads[0].ram;
                                                                                    green.total=loads[0].total;
                                                                                    green.save(function(error, savedgreen){
                                                                                              if (error){
                                                                                                console.log(error);
                                                                                              }
                                                                                              else {

                                                                                                console.log("Green list saved successfully");
                                                                                                    }
                                                                                                  });
                                                                                }
                                                                              });
                                                                          }

                                        else if (loads.length ==1 && loads[0].cpu >= 40){
                                                            // // Needs to check if that load already saved in Green
                                                            Green.find({"address":loads[0].address}, function(error, greens){
                                                              if (greens.length >=1) {
                                                                                  Green.remove({"address":loads[0].address}, function(error, removed){
                                                                                    if (removed) {console.log ("Previous Green value Dumped!")}
                                                                                  });
                                                                                  }
                                                            });
                                                            // first check if load.address belongs to Red. If not save that otherwise update

                                                            Red.find({"address":loads[0].address}, function(error, reds){
                                                              if (reds.length==1) {
                                                                                        // update
                                                                                  var red_id=reds[0]._id;
                                                                                  var newred={};
                                                                                  newred.cpu=loads[0].cpu;
                                                                                  newred.gpu=loads[0].gpu;
                                                                                  newred.ram=loads[0].ram;
                                                                                  newred.total=loads[0].total;
                                                                                  var id={_id:red_id};
                                                                                  Red.update(id, newred, function(error){
                                                                                      if (error){throw error}
                                                                                      else {console.log("Red info updated")}
                                                                                      });

                                                                                  }





                                                              else                {
                                                                                      // save

                                                                                      var red=new Red();
                                                                                      red.address=loads[0].address;
                                                                                      red.network=loads[0].network;
                                                                                      red.cpu=loads[0].cpu;
                                                                                      red.gpu=loads[0].gpu;
                                                                                      red.ram=loads[0].ram;
                                                                                      red.total=loads[0].total;
                                                                                      red.save(function(error, savedred){
                                                                                                if (error){
                                                                                                  console.log(error);
                                                                                                }
                                                                                                else {

                                                                                                  console.log("Red list saved successfully");
                                                                                                      }
                                                                                                    });
                                                                                  }
                                                                                });
                                                                            }

                                }


                              });



                    }
                    // Load.find({}, function(error, loads){
                    //   if (loads.length ==cloudlets.length) {greencheck+=1;}
                    //   else {          Green.remove({}, function(error, removed){
                    //                       if (removed){console.log("Green Cleaned!");}
                    //
                    //                               });
                    //                   Red.remove({}, function(error, removed){
                    //
                    //                     if (removed) {
                    //                       console.log("Red Cleaned!");}
                    //                     });
                    // }
                    // })

              }

        });


  redcheck+=1;
  setTimeout(currentStats, 7000);
}


currentStats();
if(x_io){rescue()};

function rescue(){
  console.log("ok we got io");
  Red.find({}, function(error, reds){
        if(reds.length>=1){



          for (var i=0; i<reds.length;i++){
                    console.log("Alert! Red Node Found with address: "+reds[i].address)
                    console.log(reds.length)
                    var redNetwork=reds[i].network
                    var redAddress=reds[i].address
                    Service.find({"name":reds[i].address}, function(error, services){

                        if (services.length>=1) {
                          // these services need to be migrated
                          // but on which destination???

                          for (var j=0; j<services.length;j++){
                            var abort = false;
                              console.log(services[j].app+" needs to be migrated");
                               var mag={};
                               mag.id=services[j]._id;
                               mag.ip=redAddress;
                               mag.application=services[j].app
                               // mag.name addition for consumer coherence
                               mag.name=mag.application;
                               mag.image=services[j].image;
                               mag.arguments=services[j].arguments;
                               mag.browser=false;
                               mag.restart=true;
                               mag.type=services[j].type;

                               (function (mag){
                                 Profile.find({"image":mag.image}, function(error, profiles){

                                    if (profiles.length==1) {
                                                        console.log("Application Profile Found");
                                                        Green.find().sort({"cpu":-1}).exec(function(error, greens){


                                                         // console.log(greens);

                                                          if (greens.length>=1) {



                                                            for (var k=0; k<greens.length && !abort;k++){
                                                                    (function(greens) {


                                                                      if (Sum(profiles[0].cpu, greens[k].cpu) <= 50 ) {

                                                                        console.log("Application Profile Matched");
                                                                        console.log("Migrating:"+mag.name);
                                                                        console.log("Found Green Node "+greens[k].address);
                                                                        mag.destination=greens[k].address;

                                                                        start_time=new Date();
                                                                        // migrate if stateful otherwise restart on destination and kill on source.
                                                                              if(mag.type==="stateless") {

                                                                                x_io.emit("start.req@"+mag.destination,mag);
                                                                                x_io.emit("stop.req@"+redAddress,mag.name);
                                                                              }
                                                                              else {

                                                                                x_io.emit("mig.req@"+redAddress,mag);
                                                                              }

                                                                        // Now update service db name for migrated service
                                                                        var newservice={};
                                                                        // new name of node
                                                                        newservice.name=mag.destination;
                                                                        var id={_id:mag.id};
                                                                        Service.update(id, newservice, function(error){
                                                                          if (error){throw error}
                                                                          else {console.log("Service name updated!")}
                                                                        });

                                                                        abort = true;

                                                                      }

                                                                    else if (k==greens.length-1) {
                                                                        console.log("All Nodes Busy! so migrating to cloud");

                                                                      }



                                                                    })(greens);

                                                            };







                                                          }



                                                      });



                                    }
                                    else {
                                          console.log("Application Profile Not Found");
                                    }
                                 });


                               }) (mag);


                            }



                        }
                      })
                    }
              // here cloudlets will close
          }

  });
  setTimeout(rescue, 7000);
}


module.exports=function(io){


  // console.log(subject);

  module.exports.subject = subject;
  module.exports.subject1 = subject1;
  module.exports.subject2 = subject2;
io.on('connection', socket => {
  console.log('A socket is opened by client: '+socket.handshake.address.split("ff:")[1]);


  // console.log(socket);
  socket.emit('cpu_stats');
  // module.exports.mySocket = socket;

  // socket.on("start.response", (result)=>{
  //   console.log("Hi we got response!");
  //   var success=result.name+" deployed successfully. You can access it ";
  //   // console.log(result);
  //   subject.next(result);
  // //  response.render('deploy_post',{success:success, dapp:dapp});
  // });
  // socket.on('register', (id)=>{
  //   socket.join(id);
  // })

  socket.on('system_utilization', (system_utilization) => {
    // console.log(system_utilization);
    // system_utilization=JSON.stringify(system_utilization);
    io.emit('sendtobrowser', system_utilization);
    setTimeout(()=> socket.emit('cpu_stats'),2000);

    });

    ///this request comes from browser or edge node
  socket.on('user_attach_req', (user) => {
    var ip=socket.handshake.address.split("ff:");
    user.ip=ip[1];

    console.log('attach request received');
    io.emit('user_attach_req_browser',user);
    if (search(user.user_id,user.app_name,  users_db)) {
      user.ack="Verified"
    io.emit('response',user);
      // io.emit('user_attach_rep_browser',user);
    }
    else {
      socket.emit('response',"NACK");
      console.log(user_attach_req.app_name);
    }

  });

  socket.on("user_left", (user)=> {
     console.log("User left message received");
     //send also to browser
    io.emit("user_left", user);

  });

  // //  // HERE we receive signal from coordinator to start containers
  // socket.on("start_containers", (data, response_callback) => {
  //   console.log("we received data "+ data.producer);
  //
  //   //start all producers & edge nodes
  //   var prod_length=data.producer.length;
  //   var edge_length=data.consumer.length;
  //
  //   for (var i=0; i<prod_length;i++){
  //     // console.log(data.producer[i].destn_node);
  //     io.emit("start@"+data.producer[i].destn_node, data.producer[i]);
  //
  //   }
  //
  //   for (var i=0; i<edge_length;i++){
  //
  //     io.emit("start@"+data.consumer[i].destn_node, data.consumer[i]);
  //
  //   }
  //
  //
  //
  //
  //   var result="ok start karta hon";
  //   response_callback(result);
  // });
  // var consumer1=new sendata("195.148.125.212");
  // var consumer2=new sendata("195.148.127.122");
  // var consumers=[consumer1, consumer2];





// Start everything only after we have received load status from all consumers


  //step 1: We receive start container event
  socket.on('start_containers', (data)=> {
	// console.log(data);
    // console.log("listening to start containers");

    // var consumer=consumers[0];
    var consumer_cpu=70;
    var ports_available=[8000,8001,8002,8003];
    var consumer_name=["consumer1","consumer2", "consumer3"];
    var producer_name=["producer1", "producer2", "producer3"];
    data.consumer[0].host_port=ports_available[0];
    // Concatenate ccordinator arguments with port info here
    // 04.06 changes, we now dont need port expose info
    // data.consumer[0].arguments=data.consumer[0].arguments+" -p "+ports_available[0]+":"+data.consumer[0].port;

    // console.log(data.consumer[0].arguments);
    data.consumer[0].name=consumer_name[0];
    data.consumer[0].browser=false;
    data.consumer[0].restart=false;
    var prod_length=data.producer.length;
    var edge_length=data.consumer.length;



  // step2: we choose consumer based on cpu load and start container on that
  Green.find({"network":data.consumer[0].network}, function(error, greens){
    // select consumer based on network
    if (greens.length==1){
      console.log(greens[0]);
      io.emit('start.req@'+greens[0].address, data.consumer[0]);
      // console.log('edge.start'+consumer_all[0].ip);
      // get start_edge event response HERE
      // data[0].host_port=ports_available[0]
      // console.log(data[0].ip)
      for (var i=0; i<edge_length;i++){
        console.log("Consumer.containers:"+edge_length)
        var Service=require('./models/services');
        var service=new Service();
        service.name=greens[0].address;
        service.app=data.consumer[i].name;
        service.image=data.consumer[i].image;
        service.arguments=data.consumer[i].arguments;
        service.save(function(error, savedservice){
          if (error){
            console.log(error);
          }
          else {
            console.log("service saved successfully");
            // response.redirect('/');
          }
        });
      }

    }
  });





      for (var i=0; i<prod_length;i++){
        data.producer[i].name=producer_name[i];
        data.producer[i].browser=false;
        data.producer[i].restart=false;

        io.emit('start.req@'+data.producer[i].ip,data.producer[i])
      }



  });

  // GET CONSUMER RESPONSES and send it to coordinator
  socket.on('start.res', (res)=>{
    console.log(res);
    console.log('from start.res');
    if(res.bflag==true){
      end_time=new Date();
                  if (res.restart==true) {
                            subject2.next(res);
                            // if(start_time1){console.log("Re-Deployment Time: "+ (end_time.getTime()-start_time1.getTime() ));}
                          }
                  else {
                      subject.next(res);
                        }


    }


    io.emit("start.status", res );
    //subject.next(null);

  });

  // Migrate RESPONSES
  socket.on('mig.res', (res)=>{
            if (res.bflag!=true){
                end_time=new Date();
                console.log("Migration Result: "+JSON.stringify(res));
                console.log("Migration Time: "+ (end_time.getTime()-start_time.getTime() ));
              }

    if (res.bflag==true){
      // console.log("bflag is:"+res.bflag);
      end_time=new Date();
      console.log("Migration Result: "+JSON.stringify(res));
      // if(start_time1) {console.log("Migration Time4: "+ (end_time.getTime()-start_time1.getTime() ));}
            // only send subj1 response if migration is
            if (!(res.restart==true)) {
              subject1.next(res);}
            }

    io.emit("mig.status", res );
    //subject.next(null);

  });

  //GET PRODUCER+CLIENT RESPONSES
  // socket.on('prod.start.res', (response)=>{
  //   console.log(response);
  //   io.emit("prod.start.status", response );
  // })

  // Now we listen to stop events here and stop containers:
  socket.on('stop_containers',(stop)=>{
    console.log(stop);
    // var consumer_length=stop.consumer.length;
    // var producer_length=stop.producer.length;
    var common_length=stop.common.length;

    for (var i=0; i<common_length;i++){

      io.emit('stop.req@'+stop.common[i].ip, stop.common[i].name);
    }

    // for (var i=0; i<producer_length;i++){
    //   io.emit('prod.stop.req@'+stop.producer[i].ip, stop.producer[i].name);
    // }


  });

  socket.on('stop.res', (response)=>{
    console.log(response);
    io.emit("stop.status", response );
  });

  //GET PRODUCER+CLIENT RESPONSES
  // socket.on('prod.stop.res', (response)=>{
  //   console.log(response);
  //   io.emit("prod.stop.status", response );
  // })

  // getload information from all Consumers
  const reducer = (accumulator, currentValue) => accumulator + currentValue;
  var counter=0;
  socket.on('send.load', (system_utilization)=>{
    // console.log("System "+system_utilization.address+" overloaded!"+ " Current Load: "+JSON.stringify(system_utilization));
    if (counter==0){

            var load=new Load();
            load.address=system_utilization.address;
            load.network=system_utilization.network;
            load.cpu=system_utilization.cpu;
            load.gpu=system_utilization.gpu;
            load.ram=system_utilization.ram;
            const array1 = [load.cpu,load.gpu, load.ram];

            load.total=array1.reduce(reducer);
            console.log("Total value:"+load.total)
            load.save(function(error, savedservice){
              if (error){
                console.log(error);
              }
              else {
                console.log("Load Info saved successfully");
          // response.redirect('/');
                    }
                  });
    }

    else {
      Load.find({"address":system_utilization.address}, function(error, loads){
        if(error) {
          console.log(error);
        }
        else {
                if (loads.length == 1){

                    var load_id=loads[0]._id;


                    }

                    // var success=mag.application+" migrated successfully.";
                    // response.render('migrate_post',{stdout:stdout, success:success, mag:mag});
                    var newload={};
                    // new name of node
                    newload.cpu=system_utilization.cpu;
                    newload.gpu=system_utilization.gpu;
                    newload.ram=system_utilization.ram;
                    const array2 = [newload.cpu,newload.gpu, newload.ram];
                    newload.total=array2.reduce(reducer);

                    var id={_id:load_id};
                    Load.update(id, newload, function(error){
                      if (error){throw error}
                      else {console.log("Load info updated for "+system_utilization.address)}
                    });




        }
      });
    }

    counter+=1;



  });

// Distribute roles to each CLIENT
Cloudlet.find({}, function(error, cloudlets){
  if(error){throw error}
  else{

    for (var i=0; i<cloudlets.length;i++){
      socket.emit("set.role@"+cloudlets[i].ip, {role:cloudlets[i].role,network:cloudlets[i].network});
    }

  }
});



  });


  function sendata (ip,app,image,arguments){
    this.ip=ip;
    this.app=app;
    this.image=image;
    this.arguments =arguments;
  }





  //search function

  function search(user_id,app, array){
      for (var i=0; i < array.length; i++) {
          if ( (array[i].app_name === app) && (array[i].user_id === user_id) ) {
              var reply="App supported and User Found! attach this";
              return reply
          }
      }
  }
  //Applictions supported
  var users_db=[{ username: 'testuser', user_id: '12345678', app_name: 'nginx' }];



  }
