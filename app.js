var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

// DB related configs:
var Sequelize = require('sequelize');
const sequelize = new Sequelize('sequelize_passport', 'root', 'asiainfo123', {
    host: 'localhost',
    dialect: 'mysql'
});




var index = require('./routes/index');
var users = require('./routes/users');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


var auth = require('./auth');
var userModel = require('./UserModel')(sequelize,Sequelize);

var config = {
    "secretcode":"this_is_demo_secret",
    "path_to_get_token":"/login",
    "paths_donot_need_token":["/login"],
    "auth_db_column":{
        "username":"email",
        "password":"password"
    },
    "login_form":{
        "username":"username",
        "password":"password"
    },
    "auth_messages":{
        "msg_missing_username":{"success":false,"message":"username required"},
        "msg_missing_password":{"success":false,"message":"username required"},
        "msg_user_notfound":{"success":false,"message":"Username does not exist"},
        "msg_password_incorrect":{"success":false,"message":"Password is incorrect"},
        "msg_internal_error":{"success":false,"message":"password required"},
        "msg_unauth_error":{"success":false,"message":"invalid token"}
    }
};
auth(app,config,userModel);




app.use('/', index);
// app.use('/users', users);

// app.use('/login',require('./routes/login'));
app.use('/private',function(err,req,res,next){
    res.status(200).send({"success":true,"message":"This is a secret content!"});
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
