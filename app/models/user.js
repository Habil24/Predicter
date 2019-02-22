var mongoose = require('mongoose');
var userSchema = mongoose.Schema;
var bcrypt = require('bcrypt-nodejs');

var userSchema = new mongoose.Schema({
    name:{type:String,lowerCase:true,required:true, unique: true},
    surname:{type:String,lowerCase:true,required:true, unique: true},
    username: {type:String,lowerCase:true,required:true, unique: true},
    password: {type:String,required: true,select:false},
    email:{type:String,required:true,lowerCase:true,unique:true},
    dateOfBirth:{type:Date,required:true},
    active:{type: Boolean, required:true,default:false},
    temporaryToken: {type:String,required:true},
    resetPassToken:{type:String,required: false}
});

userSchema.pre('save', function(next) {
    // do stuff
    var user = this;
    if(!user.isModified('password')){
        return next();
    }
    bcrypt.hash(user.password,null,null,function(err,hash){
        if(err){
            return next(err);
        }
        user.password = hash;
    });
    next();
  });

  userSchema.methods.comparePassword = function(password){
    return bcrypt.compareSync(password,this.password);
  };

module.exports = mongoose.model('User',userSchema);
