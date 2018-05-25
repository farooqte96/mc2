mongoose=require('mongoose');
var Schema=mongoose.Schema;
//Cloudlet schema

var cloudlet=mongoose.Schema({
  name:{type:String,require:true},
  ip:{type:String, required:true},
  network:{type:String, required:true},
  ssh_key:{type:String, required:true},
  role:{type:String, required:true}
});

module.exports=mongoose.model('cloudlet',cloudlet);
