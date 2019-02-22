/*NOTEEEEE this part mainly uses NodeJS Express module for server */
// Require needed modules 
var express = require('express');
var app = express();
var morgan = require('morgan');
var mongoose = require('mongoose');
var router = express.Router();
var appRoutes = require('./app/routes/api')(router);
var bodyParser = require('body-parser');
var path = require('path');


// Log the using stuff
app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
// Used for connection of back end and fornt end(Front end will have access to it)
app.use(express.static(__dirname + '/public'));
app.use('/api',appRoutes);

// Use morgan as middleware for logging requests
app.use(morgan('dev'));
// Connect do DB
mongoose.connect("mongodb://localhost:27017/mydb",function(err){
    if(err){
        console.log('There was a problem in connection to database...' + err);
    }else{
    console.log('connected to database...');
    }
});

// no matter what user passes feed them with the path below
app.get('*',function(req,res){
    res.sendFile(path.join(__dirname + '/public/app/views/index.html'));
});

// Provide a port to listen
app.listen(2000,function(){
    console.log("Port 2000 is being listened...");
});

