var Cloudlet=require('./models/cloudlet');
var Load=require('./models/loads');
var Service=require('./models/services');
var Green=require('./models/green');
var Red=require('./models/red');
const{Observable,BehaviorSubject,Subject } =  require('rxjs');

// var subject = new BehaviorSubject(null);
// subject for deploy and subject1 for migrate.
var z=require('./app.js');
// console.log('assigning subject');
var x_io=z.io;
var subject = new Subject(null);
var subject1= new Subject(null);
var greencheck=0;
var redcheck=0;
//check cpu info on all consumers & filter them into green and red nodes

function currentStats(){

  // console.log("Greencheck At the start"+greencheck);
  // redcheck to filter out previous simulation loads values
  if(redcheck==0) {Load.remove({}, function(error, removed){
                if (removed) {console.log("Previos values cleared!");}
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
                                        if (loads.length ==1 && loads[0].cpu <= 10 ) {

                                                          console.log("Looking at: "+loads[0].address)
                                                          console.log("current value:"+greencheck);
                                                        if (greencheck==0) {

                                                          console.log("Greenheck zero executed!"+greencheck);
                                                          var green=new Green();
                                                          green.address=loads[0].address;
                                                          green.network=loads[0].network;
                                                          green.cpu=loads[0].cpu;
                                                          green.gpu=loads[0].gpu;
                                                          green.ram=loads[0].ram;
                                                          green.save(function(error, savedgreen){
                                                            if (error){
                                                              console.log(error);
                                                            }
                                                            else {

                                                              console.log("Green list saved successfully");


                                                            }
                                                          });




                                                        }
                                                        else {
                                                          // update
                                                          Green.find({"address":loads[0].address}, function(error, greens){
                                                            if(error) {
                                                              console.log(error);
                                                            }
                                                            else {
                                                                      if (greens.length == 1){

                                                                         var green_id=greens[0]._id;


                                                                          }

                                                                      var newgreen={};

                                                                      newgreen.cpu=loads[0].cpu;
                                                                      newgreen.gpu=loads[0].gpu;
                                                                      newgreen.ram=loads[0].ram;
                                                                      var id={_id:green_id};
                                                                      Green.update(id, newgreen, function(error){
                                                                      if (error){throw error}
                                                                      else {console.log("Green info updated")}
                                                                      });







                                                            }
                                                          });
                                                        }



                                                      // Marks end
                                                      }
                                                      // loads.length ==1 && loads[0].cpu >= 80 && loads[0].gpu >= 80 && loads[0].ram >=80
                                        else if (loads.length ==1 && loads[0].cpu >= 10){
                                          if (greencheck==0) {

                                            console.log("Redheck zero executed!"+greencheck);
                                            var red=new Red();
                                            red.address=loads[0].address;
                                            red.network=loads[0].network;
                                            red.cpu=loads[0].cpu;
                                            red.gpu=loads[0].gpu;
                                            red.ram=loads[0].ram;
                                            red.save(function(error, savedred){
                                              if (error){
                                                console.log(error);
                                              }
                                              else {

                                                console.log("Red list saved successfully");

                                              }
                                            });




                                          }
                                          else {
                                            // update
                                            Red.find({"address":loads[0].address}, function(error, reds){
                                              if(error) {
                                                console.log(error);
                                              }
                                              else {
                                                        if (reds.length == 1){

                                                           var red_id=reds[0]._id;


                                                            }

                                                        var newred={};

                                                        newred.cpu=loads[0].cpu;
                                                        newred.gpu=loads[0].gpu;
                                                        newred.ram=loads[0].ram;
                                                        var id={_id:red_id};
                                                        Red.update(id, newred, function(error){
                                                        if (error){throw error}
                                                        else {console.log("Red info updated")}
                                                        });







                                              }
                                            });
                                          }




                                        }

                                }


                              });



                    }
                    Load.find({}, function(error, loads){
                      if (loads.length ==cloudlets.length) {greencheck+=1;}
                      else {          Green.remove({}, function(error, removed){
                                          if (removed){console.log("Green Cleaned!");}

                                                  });
                                      Red.remove({}, function(error, removed){

                                        if (removed) {
                                          console.log("Red Cleaned!");}
                                        });
                    }
                    })

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
          console.log("Alert! I found some red nodes!!")
          for (var i=0; i<reds.length;i++){
                    console.log(reds.length)
                    var redNetwork=reds[i].network
                    var redAddress=reds[i].address
                    Service.find({"name":reds[i].address}, function(error, services){

                        if (services.length>=1) {
                          // these services need to be migrated
                          // but on which destination???
                          for (var j=0; j<services.length;j++){
                              console.log(services[j].app+" needs to be migrated");
                               var mag={};
                               mag.id=services[j]._id;
                               mag.application=services[j].app
                               mag.image=services[j].image;
                               mag.arguments=services[j].arguments;
                               mag.browser=false;
                              Green.find({"network":redNetwork}, function(error, greens){
                                  if (greens.length>=1) {
                                    mag.destination=greens[0].address;
                                    x_io.emit("mig.req@"+redAddress,mag);
                                    // Now update service db name for migrated service
                                    var newservice={};
                                    // new name of node
                                    newservice.name=mag.destination;
                                    var id={_id:mag.id};
                                    Service.update(id, newservice, function(error){
                                      if (error){throw error}
                                      else {console.log("Service name updated!")}
                                    });

                                  }
                                  else {console.log("NO Green from Network of Red Node!");
                                        // when we dont get consumer from current network, we get green from another available network
                                            Green.find({}, function(error, greens){
                                                if (greens.length>=1){
                                                      mag.destination=greens[0].address;
                                                      x_io.emit("mig.req@"+redAddress,mag);

                                                      // Now update service db name for migrated service
                                                      var newservice={};
                                                      // new name of node
                                                      newservice.name=mag.destination;
                                                      var id={_id:mag.id};
                                                      Service.update(id, newservice, function(error){
                                                        if (error){throw error}
                                                        else {console.log("Service name updated!")}
                                                      });
                                                }
                                            });



                                          }
                              });
                          }

                                // var mag={};
                                // mag.id=services[i]._id;
                                // mag.application=services[i].name
                                // mag.image=services[i].image;
                                // mag.arguments=services[i].arguments;
                                // mag.destination="195.148.127.212";
                                //   if (reds.length ==1) {
                                //     x_io.emit("mig.req@"+reds[0].address,mag);
                                //   }
                        }
                      })
          }

          }

  });
  setTimeout(rescue, 7000);
}


module.exports=function(io){


  // console.log(subject);

  module.exports.subject = subject;
  module.exports.subject1 = subject1;
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
    data.consumer[0].arguments=data.consumer[0].arguments+" -p "+ports_available[0]+":"+data.consumer[0].port;
    // console.log(data.consumer[0].arguments);
    data.consumer[0].name=consumer_name[0];
    data.consumer[0].browser=false;
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

        io.emit('start.req@'+data.producer[i].ip,data.producer[i])
      }



  });

  // GET CONSUMER RESPONSES and send it to coordinator
  socket.on('start.res', (res)=>{
    console.log(res);
    console.log('from start.res');
    if(res.bflag==true){
      subject.next(res);
    }

    io.emit("start.status", res );
    //subject.next(null);

  });

  // Migrate RESPONSES
  socket.on('mig.res', (res)=>{
    console.log("Migration Result: "+JSON.stringify(res));
    if (res.bflag==true){
      console.log("bflag is:"+res.bflag);
      subject1.next(res);
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
