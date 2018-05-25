var node1_system={"cpu":"100%", "gpu":"20%", "memory":"40%"};
var node2_system={"cpu":"100%", "gpu":"40%", "memory":"60%"};
var node1_system = JSON.stringify(node1_system);
var system_utilization=node1_system;

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


var rootNamespace=socket => {
  console.log('A new socket is now open with id: '+socket.id);
  // console.log(socket);
  socket.emit('cpu_stats');


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


};


module.exports.rootNamespace=rootNamespace;
