var express = require('express');
var router = express.Router();
var User = require('../models/user');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

//validator
const {
    check,
    validationResult
} = require('express-validator/check');



/* GET users listing */
router.get('/', function (req, res, next) {

    res.send('respond with a resource');

});

router.get('/register', function (req, res, next) {

    res.render('register', {
        errors: {}
    });

});

router.get('/login', function (req, res, next) {

    res.render('login', {
        errors: {}
    });

});

router.post('/login',
    passport.authenticate('local', {
        failureRedirect: '/users/login',
        failureFlash: 'Invalid username or password'
    }),
    function (req, res) {
        req.flash('success', 'You are now logged in');
        res.redirect('/');
    });

//Local Strategy for passport authentication
passport.use(new LocalStrategy(
    function (username, password, done) {
        User.getUserByUsername(username, function (err, user) {
            if (err) {
                return done(err);
            }
            if (!user) {
                return done(null, false, {
                    message: 'Incorrect username.'
                });
            }
            User.comparePassword(password, user.password, function (err, isMatch) {
                if (err) return done(err);
                if (isMatch) {
                    return done(null, user);
                } else {
                    return done(null, false, {
                        message: 'Invalid Password'
                    });
                }
            });
        });
    }
));

//user serialization
passport.serializeUser(function (user, done) {
    done(null, user.id);
});

passport.deserializeUser(function (id, done) {
    User.getUserById(id, function (err, user) {
        done(err, user);
    });
});


router.post('/register', [check('name').isLength({
        min: 3
    }), check('email').isEmail(), check('username').isLength({
        min: 3
    }), check('password1').isLength({
        min: 1
    })
    .custom((value, {
        req
    }) => {
        if (value !== req.body.password2) {
            // throw an error if passwords do not match
            throw new Error("Passwords don't match");
        } else {
            return value;
        }
    }),
], function (req, res, next) {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        // console.log(errors.array(), 'ERROR')
        var err = errors.array();
        console.log(err)
        res.render('register', {
            errors: err
        });
    } else {

        var name = req.body.name;
        var email = req.body.email;
        var username = req.body.username;
        var password1 = req.body.password1;

        var newUser = new User({
            name: name,
            email: email,
            username: username,
            password: password1,
            user_role: 'normal_user',
            joinedAt: new Date().getTime()
        });

        User.createUser(newUser, function (err, res) {
            if (err) throw err;
            console.log(res);
        })

    }
});

router.get('/logout', function (req, res) {
    req.logout();
    req.flash('success', 'You are now logged out');
    res.redirect('users/login');
})
module.exports = router;