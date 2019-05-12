var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', {
    title: 'Express'
  });
});

/*GET about page */
router.get('/about', function (req, res, next) {
  res.render('about');
});

/* GET contact page */
router.get('/contact', function (req, res, next) {
  res.render('contact');
});

/* GET courses */
router.get('/courses', ensureAuthenticated, function (req, res, next) {
  res.render('courses');
});

function ensureAuthenticated(req, res, next){
  if(req.isAuthenticated()){
    return next();
  }
res.redirect('/users/login');
}

/* GET course page. */
router.get('/course', function (req, res, next) {

  res.render('course');
});

module.exports = router;