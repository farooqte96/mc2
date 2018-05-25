//Deploy remote
var express=require('express');
var app=express();
var env = Object.create(process.env);

var arg1="docker-nginx";
var arg2="80";
var arg3="nginx";


// console.log(env.arg2);
var exec=require('ssh-exec');

var node='tufailm1@195.148.127.245';



  exec("echo cXYwU4t2vGGFjvCGCnGK | sudo -S ./test.sh " + arg1 + " " + arg2 + " " + arg3 ,node,function(err, stdout){
    if(err){
      throw err;
    }
    console.log(stdout);
    console.log('success');

  });
