mongoose=require('mongoose');
var Schema=mongoose.Schema;
//Services schema

var load=mongoose.Schema({
  address:{type:String,require:true},
  network:{type:String,require:true},
  cpu:{type:Number,require:true},
  gpu:{type:Number, required:true},
  ram:{type:Number, required:true},
  total:{type:Number, required:true}
});

module.exports=mongoose.model('load',load);
