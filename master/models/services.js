mongoose=require('mongoose');
var Schema=mongoose.Schema;
//Services schema

var service=mongoose.Schema({
  name:{type:String,require:true},
  app:{type:String,require:true},
  image:{type:String, required:true},
  type:{type:String, required:true},
  arguments:{type:String, required:true}
});

module.exports=mongoose.model('service',service);
