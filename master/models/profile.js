mongoose=require('mongoose');
var Schema=mongoose.Schema;
//Cloudlet schema

var profile=mongoose.Schema({
  name:{type:String,require:true},
  image:{type:String,require:true},
  cpu:{type:Double, required:true},
  gpu:{type:Double, required:true},
  ram:{type:Double, required:true}
});

module.exports=mongoose.model('profile',profile);
