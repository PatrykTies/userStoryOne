var config = require('../../config.js');
var User = require('../models/user.js');
var jsonwebtoken = require('jsonwebtoken');
var Story = require('../models/story.js');
var secretKey = config.secretKey;

function createToken(user){
     var token = jsonwebtoken.sign({
        _id: user._id,
        name: user.name,
        username: user.username
    }, secretKey, { //=============================HERE WE PASS SECRET KEY FOR ENCRYPT ALGO FROM CONFIG.JS
        expiresInMinute: 1440
    });
    return token;
}

//THIS MAKES API FUNCTION
module.exports = function(app,express,io){
    var api = express.Router();
    
    //ALL STORIES   
    api.get('/all_stories', function(req,res){
        Story.find({}, function(err, stories){
            if(err) throw err;
            res.json(stories);
        });
    });
    
    api.post('/signup', function(req,res){
        var user = new User({
                    name:req.body.name,
                    username:req.body.username,
                    password:req.body.password
                    });
        var token = createToken(user);
        user.save(function(err){
            if(err){
                res.send(err);
                return;}
            res.json({success: true, message:'User created!', token: token});
        });
    });
    api.post('/login', function(req,res){
        User.findOne({username:req.body.username})
            .select('password')
            .exec(function(err,user){
                if(err) throw err;
                else if(!user) res.send({message:'User dont exist'});
                else if(user){
                    var validPassword = user.comparePassword(req.body.password);
                    if(!validPassword) res.send({message:'Invalid Password'});
                    else{
                        var token = createToken(user);
                        res.json({
                            success: true,
                            message: 'Login successful',
                            token:token
                        });
                    }
                }
        });
        
    });
    
    //MIDDLEWARE TO CHECK IF TOKEN IS CORRECT AND IF YES ALLOWING USER TO VISIT A WEBAPP CONTENT
    api.use(function(req,res,next){
        console.log('Someone visited');
        var token = req.body.token || req.headers['x-access-token'];
        if(token){
            jsonwebtoken.verify(token, secretKey, function(err,decoded){
                if(err) res.status(403).send({success:false, message:'Failed to indentify you'});
                else{
                    req.decoded = decoded;
                    next();
                }
            });
        }else{
           res.status(403).send({success:false, message:'No token provided'}); 
        }
    });
    
    
    //AFTER TOKEN HAS BEEN VERIFIED USER CAN ACCESS BELOW API
    api.get('/users', function(req,res){
        User.find({}, function(err,users){
            if(err){
                res.send(err);
                return;
            } 
            res.json(users);
        });
    });
    
    //MULTIPLE REQUESTS ON 1 ROUT - home.html
    api.route('/')
        .post(function(req,res){
            var story = new Story({
                creator: req.decoded._id,
                content: req.body.content
            });
            story.save(function(err, newStory){
                if(err) throw err;
                io.emit('story', newStory)
                res.json({message:'New story added'});
            });
        })
        .get(function(req,res){
            Story.find({creator: req.decoded._id}, function(err, stories){
                if(err) throw err;
                res.json(stories);
            });
    });
    
    api.get('/me', function(req,res){
        res.json(req.decoded);
    });
    
    return api;
};