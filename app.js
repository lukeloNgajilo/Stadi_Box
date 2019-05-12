   var createError = require('http-errors');
   var express = require('express');
   var app = express();
   var bodyParser = require('body-parser');

   var path = require('path');
   var cookieParser = require('cookie-parser');
   var logger = require('morgan');
   var session = require('express-session');
   var passport = require('passport');
   var LocalStrategy = require('passport-local').Strategy;
   const bcrypt = require("bcryptjs");
   var flash = require('express-session');
   var mongo = require('mongodb');
   var mongoose = require('mongoose');
   var db = mongoose.connection;



   var indexRouter = require('./routes/index');
   var usersRouter = require('./routes/users');

   // body parser
   app.use(bodyParser.json());

   // view engine setup
   app.set('views', path.join(__dirname, 'views'));
   app.set('view engine', 'ejs');


   app.use(logger('dev'));
   app.use(express.json());
   app.use(express.urlencoded({
     extended: false
   }));
   app.use(cookieParser());
   app.use(express.static(path.join(__dirname, 'public')));


   //handle Sessions 
   app.use(session({
     secret: 'secret',
     saveUninitialized: true,
     resave: true
   }));

   //passport
   app.use(passport.initialize());
   app.use(passport.session());

   //validator
   const {
     check,
     validationResult
   } = require('express-validator/check');

   //express-flash messages

   app.use(require('connect-flash')());

   //Global messages
   app.use(function (req, res, next) {
     res.locals.messages = require('express-messages')(req, res);
     next();
   });


   //Global Variable for checking user login status
   app.get('*', function (req, res, next) {
     res.locals.user = req.user || null
     next()
   })

   app.use('/', indexRouter);
   app.use('/users', usersRouter);


   // catch 404 and forward to error handler
   app.use(function (req, res, next) {
     next(createError(404));
   });

   // error handler
   app.use(function (err, req, res,
     next) {
     // set locals, only providing error in development
     res.locals.message = err.message;
     res.locals.error = req.app.get('env') === 'development' ? err : {};

     // render the error page
     res.status(err.status || 500);
     res.render('error');
   });

   module.exports = app;