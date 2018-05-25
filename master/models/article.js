mongoose=require('mongoose');
var Schema=mongoose.Schema;
//Article schema

var article=mongoose.Schema({
  title:{type:String,require:true},
  author:{type:String, required:true},
  body:{type:String, required:true}
});

module.exports=mongoose.model('article',article);
