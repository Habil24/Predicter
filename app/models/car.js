var mongoose = require('mongoose');
var userSchema = mongoose.Schema;
var bcrypt = require('bcrypt-nodejs');

var carSchema = new mongoose.Schema({
    Name:{type:String},
    MPG:{type:Number},
    cylinders:{type:Number},
    displacement:{type:Number},
    horsepower:{type:Number},
    weight:{type:Number},
    acceleration:{type:Number},
    year:{type:Date},
    origin:{type:String}
});


module.exports = mongoose.model('Car',carSchema);