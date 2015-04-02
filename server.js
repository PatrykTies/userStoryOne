var express = require('express');
var bodyParser = require('body-parser');
var morgan = require('morgan');
var mongoose = require('mongoose');
var config = require('./config.js');
var app = express();

var http = require('http').Server(app);
var io = require('socket.io')(http);

var api = require('./app/routs/api.js')(api,express,io);

//DB CONNECTION
mongoose.connect(config.database, function(err){
    if(err) console.log(err);
    else console.log('DB connected');
});

//USE SECTION
app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());
app.use(morgan('dev'));
app.use('/api',api);
app.use(express.static(__dirname + '/public'));
//SET UP VIEW ROUT
app.get('/', function(req,res){
    res.sendFile(__dirname + '/public/app/views/index.html');

});



http.listen(config.port, function(err){
    if(err) console.log(err);
    else console.log('Server is live on port 3000!!!');  
});