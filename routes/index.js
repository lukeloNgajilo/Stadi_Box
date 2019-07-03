var express = require("express");
var router = express.Router();
var User = require("../models/user");
var Content = require("../models/content");

/* GET home page. */
router.get("/", function (req, res, next) {
  User.countDocuments({}, function (err, count) {
    // console.log('there are %d users', count);

    Content.countDocuments({}, function (err, count2) {
      //console.log('there are %d users and %d materials', count, count2);

      res.render("index", {
        errors: {},
        users: count,
        resources: count2
      });
    });
  });
});

/*GET Forum Page */
router.get("/forum", ensureAuthenticated, function (req, res, next) {
  res.render("forum_index");
});

/*GET about page */
router.get("/about", function (req, res, next) {
  User.countDocuments({}, function (err, count) {
    // console.log('there are %d users', count);

    Content.countDocuments({}, function (err, count2) {
      //console.log('there are %d users and %d materials', count, count2);

      res.render("about", {
        errors: {},
        users: count,
        resources: count2
      });
    });
  });
});

/* GET contact page */
router.get("/contact", function (req, res, next) {
  User.countDocuments({}, function (err, count) {
    // console.log('there are %d users', count);

    Content.countDocuments({}, function (err, count2) {
      //console.log('there are %d users and %d materials', count, count2);

      res.render("contact", {
        errors: {},
        users: count,
        resources: count2
      });
    });
  });
});

/* GET courses */
router.get("/courses", function (req, res, next) {
  res.render("courses");
});

/* GET ChatBOX */
router.get("/chatbox", ensureAuthenticated, function (req, res, next) {
  console.log(__dirname);
  res.sendFile(__dirname + "/client/index.html");
});

function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect("/users/login");
}

/* GET course page. */
router.get("/course", function (req, res, next) {
  res.render("course");
});

module.exports = router;