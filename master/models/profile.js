mongoose=require('mongoose');
var Schema=mongoose.Schema;
//Cloudlet schema

var profile=mongoose.Schema({
  name:{type:String,require:true},
  image:{type:String,require:true},
  cpu:{type:Number, required:true},
  gpu:{type:Number, required:true},
  ram:{type:Number, required:true}
});

module.exports=mongoose.model('profile',profile);
