mongoose=require('mongoose');
var Schema=mongoose.Schema;
//Cloudlet schema

var profile=mongoose.Schema({
  name:{type:String,require:true},
  image:{type:String,require:true},
  cpu:{type:String, required:true},
  gpu:{type:String, required:true},
  ram:{type:String, required:true}
});

module.exports=mongoose.model('profile',profile);
