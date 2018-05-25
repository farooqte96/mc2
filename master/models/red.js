mongoose=require('mongoose');
var Schema=mongoose.Schema;
//Services schema

var red=mongoose.Schema({
  address:{type:String,require:true},
  network:{type:String,require:true},
  cpu:{type:String,require:true},
  gpu:{type:String, required:true},
  ram:{type:String, required:true}
});

module.exports=mongoose.model('red',red);
