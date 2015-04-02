var m = require('mongoose');
var bycrypt = require('bcrypt-nodejs');

var Schema = m.Schema;
//MAKING A SCHEMA OBJ & ITS PREFERENCES
var UserSchema = new Schema({
    name:String,
    username:{type:String,required:true,index:{unique:true}},
    password:{type:String,required:true,select:false}                        
});

//PASSWORD HASHING
UserSchema.pre('save', function(next){
    var user = this;
    if(!user.isModified('password')) return next();
    bycrypt.hash(user.password, null,null,function(err,hash){
        user.password = hash;
        next();
    });
});
//PREPARED CUSTOM FUNCTION FOR PASSWORD COMPARISONS
UserSchema.methods.comparePassword = function(password){
    var user = this;
    return bycrypt.compareSync(password, user.password);
};


//EXPORTING TO API
module.exports=m.model('User', UserSchema);

