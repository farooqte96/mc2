var express=require('express');
var app=express();
var path=require('path');
var router=express.Router();
var bodyParser=require('body-parser');
var mongoose=require('mongoose');
mongoose.connect('mongodb://localhost/mec');

router.use(bodyParser.json());
router.use(bodyParser.urlencoded({extended:false}));

//Bring in Models
var Cloudlet=require('./models/cloudlet');

app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'pug');

var path = __dirname + '/views/';





//Set Public Folder for static files
app.use(express.static(path.join(__dirname,'public')));
//Home route
router.get("/", function(request,response){
  Cloudlet.find({}, function(error, cloudlets){
    if(error) {
      console.log(error);
    }
    else {

      response.sendFile(path + "index.pug",
      {
        title:'Registered Nodes',
        cloudlets:cloudlets

      });
    }
  });


// console.log("hello");
});

module.exports=router;
