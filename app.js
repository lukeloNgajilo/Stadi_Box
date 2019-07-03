var createError = require("http-errors");
var express = require("express");
var app = express();
var bodyParser = require("body-parser");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
var session = require("express-session");
var passport = require("passport");
var LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcryptjs");
var flash = require("express-session");
var mongo = require("mongodb");
var mongoose = require("mongoose");
var db = mongoose.connection;

var http = require("http");
const socketIO = require("socket.io");
const port = process.env.PORT || 3001;
var app = express();
var server = http.createServer(app); // to use http server instead of express
var io = socketIO(server);

const {
  generateMessage,
  generateLocationMessage
} = require("./utils/message.js");
const {
  isRealString
} = require('./utils/validation');
const {
  Users
} = require('./utils/users');
var users = new Users();

var indexRouter = require("./routes/index");
var usersRouter = require("./routes/users");
var contentsRouter = require("./routes/contents");

// body parser
app.use(bodyParser.json());

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(logger("dev"));
app.use(express.json());
app.use(
  express.urlencoded({
    extended: false
  })
);
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

//Express Sessions
app.use(
  session({
    secret: "secret",
    saveUninitialized: true,
    resave: true
  })
);

//passport middleware
app.use(passport.initialize());
app.use(passport.session());

//validator
const {
  check,
  validationResult
} = require("express-validator/check");

//connect flash
app.use(require("connect-flash")());

//Global messages
app.use(function (req, res, next) {
  res.locals.messages = require("express-messages")(req, res);
  next();
});

//Global Variables
app.use("*", function (req, res, next) {
  res.locals.user = req.user || null;
  res.locals.success_msg = req.flash("success_msg");
  res.locals.error_msg = req.flash("error_msg");
  res.locals.error = req.flash("error");

  next();
});

app.use("/", indexRouter);
app.use("/users", usersRouter);
app.use("/contents", contentsRouter);

//  app.get('/chatbox', function (req, res) {
//    res.sendFile(__dirname + '/public/client/index.html');
//  });

io.on("connection", socket => {
  console.log("New user connected");

  socket.on("join", (params, callback) => {
    if (!isRealString(params.name) || !isRealString(params.room)) {
      return callback("Name and room name are required.");
    }

    socket.join(params.room);
    users.removeUser(socket.id);
    users.addUser(socket.id, params.name, params.room);

    io.to(params.room).emit("updateUserList", users.getUserList(params.room));
    socket.emit(
      "newMessage",
      generateMessage("Admin", "Welcome to the chat app")
    );
    socket.broadcast
      .to(params.room)
      .emit(
        "newMessage",
        generateMessage("Admin", `${params.name} has joined.`)
      );
    callback();
  });

  socket.on("createMessage", (message, callback) => {
    var user = users.getUser(socket.id);

    if (user && isRealString(message.text)) {
      io.to(user.room).emit(
        "newMessage",
        generateMessage(user.name, message.text)
      );
    }

    callback();
  });

  socket.on("createLocationMessage", coords => {
    var user = users.getUser(socket.id);

    if (user) {
      io.to(user.room).emit(
        "newLocationMessage",
        generateLocationMessage(user.name, coords.latitude, coords.longitude)
      );
    }
  });

  socket.on("disconnect", () => {
    var user = users.removeUser(socket.id);

    if (user) {
      io.to(user.room).emit("updateUserList", users.getUserList(user.room));
      io.to(user.room).emit(
        "newMessage",
        generateMessage("Admin", `${user.name} has left.`)
      );
    }
  });
});

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

//module.exports = app;

var serverr = server.listen(port, () => {
  console.log(`The port number is ::: ${port}`);
  console.log("The IP address is :::  " + serverr.address().address);
  console.log("The IP family is :::   " + serverr.address().family);
});