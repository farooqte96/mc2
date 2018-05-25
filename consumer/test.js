// var app=["nginx","alpha","beta","gamma"];
// var user_app="nginx";
// if (app.indexOf(user_app) > -1) {console.log("Found");}
// else {console.log("Not Found");}

// function createUser (username,user_id,app_name){
//   this.username=username;
//   this.user_id=user_id;
//   this.app_name=app_name;
// }
// var user1=new createUser("testuser","12345678", "nginx");
//
//
// //no user now
// // users.push(user1); //some existing registered users
//
// var users=[];
// users.push(user1);
//
// // if(users.indexOf(user1.name) > -1) {console.log("user allowed");}
//
// function search(user_id,app, array){
//     for (var i=0; i < array.length; i++) {
//         if ( (array[i].app_name === app) && (array[i].user_id === user_id) ) {
//             var reply="App supported and User Found";
//             return reply
//         }
//     }
// }
//
//
//
// console.log(search("12345678","nginx",  users));
var exec=require('child_process').exec;
var command="python test.py";
var command2="python test1.py";
var datastring='';

// module.exports={

// x;

    //   var x= exec(command,function(err, stdout){
    //     if(err){
    //     throw err;
    //     }
    //
    //
    //
    //     var result=stdout;
    //     // console.log(result);
    //
    //
    //
    //
    //
    // });


     // console.log(x);
     // return stdout;
     // return stdout;
// console.log(x);

// }

 // function abc(callback){
 //   var x=exec(command,function(err,stdout){
 //
 //     username=stdout;
 //     callback(username);
 //   });
 // }
 //
 //
 //
 //
 //     abc(function(username){
 //       var z=username;
 //       console.log(z);
 //       return z
 //     });




var operation={

  cont: function(result){
    exec(command,function(err,stdout){
      var convert=JSON.parse(stdout);
      result(convert);
      // console.log(stdout);

    });

    // return 77;
  },

// callback: function(username){
//    console.log(username);
//    return username;
//  }

inst:function(result){
  exec(command2,function(err,stdout){
    var convert=JSON.parse(stdout);
    result(convert);
    // console.log(stdout);

  });

  // return 77;
},

}
var dapp={};
 module.exports=operation;
// operation.sub();
// // sleep(1000);
// console.log(dapp.cpu)
