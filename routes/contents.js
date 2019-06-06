var express = require('express');
var router = express.Router();
var Content = require('../models/content');
const multer = require('multer');
const path = require('path');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var User = require('../models/user');
var Download = require('../models/download');
var moment = require('moment');
const fs = require('fs')


//validator
const {
    check,
    validationResult
} = require('express-validator/check');

//Storage Engine -- Disk Storage ---- Multer
const storage = multer.diskStorage({
    destination: './public/uploads/',
    filename: function (req, file, callback) {
        callback(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});

// Init Upload 
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 1000000
    }
}).fields([{
        name: 'coverimageFile',
        maxCount: 1
    },
    {
        name: 'materialFile',
        maxCount: 1
    }
]);

// //check file type

// fileFilter: function (req, file, callback) {
//         //console.log(file);
//         // callback(null, true)
//         checkFileType(file, callback);
//     }
// function checkFileType(file, callback) {
//     //allowed ext
//     const filetypes = /jpeg|jpg|png|gif/;



//     if (file.fieldname == 'coverimageFile') {

//         //check ext
//         const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
//         //check mime type
//         const mimetype = filetypes.test(file.mimetype);

//         if (mimetype && extname) {
//             return callback(null, true);
//         } else {
//             callback('Error : Images Only!')
//         }

//     }

//     // if (mimetype && extname) {
//     //     return callback(null, true);
//     // } else {
//     //     callback('Error : Images Only!')
//     // }
// }

// GET dashboard page
router.get('/dashboard', ensureAuthenticated1, function (req, res, next) {

    res.render('dashboard/dashboard_main');

});

// GET tables page
router.get('/tables', ensureAuthenticated1, function (req, res, next) {

    Content.getMaterials(function (err, result) {
        if (!err) {
            console.log(result);
            res.render('dashboard/tables', {
                list: result
            });
        } else {
            console.log(err);
        }

    });

});



router.get('/upload', ensureAuthenticated1, function (req, res, next) {

    res.render('dashboard/upload', {
        msg: '',
        viewTitle: 'Uploading Content',
        data: {}
    })
});

router.post('/upload', function (req, res) {
    upload(req, res, (err) => {
        if (err) {
            console.log(err);
            res.render('dashboard/upload', {
                msg: err
            });
        } else {
            console.log(req.files);
            console.log(req.files.coverimageFile[0].path);
            res.send('test');
            //console.log("This is the original name", req.files.coverimageFile[0].originalname.substring(0, req.files.coverimageFile[0].originalname.indexOf('.')));


            var title = req.body.title;
            var filetype = req.body.fileType;
            var topic = req.body.topic;
            var grade = req.body.grade;
            var textSummary = req.body.textSummary;
            var textDescription = req.body.textDescription;
            var user = req.user;
            console.log("This is the user", user)


            console.log({
                "title": title,
                "filetype": filetype,
                "Topic": topic,
                "Grade": grade,
                "textSummary": textSummary,
                "textDescription": textDescription
            });

            var data = {
                title: title,
                fileType: filetype,
                topic: topic,
                grade: grade,
                textSummary: textSummary,
                textDescription: textDescription,
                createdAt: moment().format("MMM Do YY"),
                coverimageURL: req.files.coverimageFile[0].path,
                OriginalName: req.files.materialFile[0].originalname.substring(0, req.files.materialFile[0].originalname.indexOf('.')),
                mimeType: req.files.materialFile[0].mimetype,
                fileURL: req.files.materialFile[0].path,
                uploadedBy: req.user._id,
                uploaderName: req.user.name
            }


            if (req.body.id == '') {

                var newContent = new Content(data)
                Content.createContent(newContent, function (err, res) {
                    if (err) throw err;
                    console.log(res);
                })
            } else {

                Content.findById(req.body.id, function (err, content) {
                    if (!err) {
                        imagePath = content.coverimageURL;
                        filepath = content.fileURL;

                        fs.unlink(imagePath, (err) => {
                            if (err) {
                                console.error(err)
                                return
                            }
                            console.log('Image file Removed')
                        })

                        fs.unlink(filepath, (err) => {
                            if (err) {
                                console.error(err)
                                return
                            }
                            console.log('file Removed')
                        })
                    }
                });

                Content.findByIdAndUpdate(req.body.id, data, (err, content) => {

                    if (!err) {
                        console.log('updated seccesfully', content);

                    } else {
                        console.log(err);
                    }

                });
            }

        }
    });

});





router.post('/login',
    passport.authenticate('local', {
        failureRedirect: '/contents/login_dashboard',
        failureFlash: true
    }),
    function (req, res) {
        req.flash('success_msg', 'You are now logged in');
        req.body.title
        res.redirect('/contents/dashboard');
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

//check if authenticated
function ensureAuthenticated1(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/contents/login_dashboard');
}

//log in to dashboard

router.get('/login_dashboard', function (req, res, next) {

    res.render('dashboard/login_dashboard', {
        errors: {}
    });

});


//get course
router.get('/download/:id', ensureAuthenticated, (req, res, next) => {

    Content.findById(req.params.id, (err, content) => {
        if (!err) {
            var name = content.fileURL.substring(15, content.fileURL.length);
            var downloadURL = `/uploads/${name}`

            console.log(downloadURL);
            res.render('download', {
                downloadURL: downloadURL
            });
            res.render('download');
        }

    });






    
});

function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/users/login');
}


//get course
router.get('/course/:id', (req, res, next) => {

    console.log('Course ID', req.params.id);

    Content.findById(req.params.id, (err, content) => {

        if (!err) {

            console.log('Course DETAILS', content);
            res.render('course', {
                content: content
            });
        }
    });
});


//get courses

router.get('/courses/:page', (req, res, next) => {
    let perPage = 6;
    let page = req.params.page || 1;

    Content
        .find({}) // finding all documents
        .skip((perPage * page) - perPage) // in the first page the value of the skip is 0
        .limit(perPage) // output just 6 items
        .exec((err, contents) => {
            Content.count((err, count) => { // count to calculate the number of pages
                if (err) return next(err);
                res.render('courses', {
                    contents,
                    current: page,
                    pages: Math.ceil(count / perPage)
                });
            });
        });
});

//get for updating content

router.get('/:id', function (req, res) {

    Content.findById(req.params.id, (err, content) => {
        if (!err) {
            res.render('dashboard/upload', {
                msg: '',
                viewTitle: "Update Content",
                data: content
            });
        }

    });

});

router.get('/delete/:id', function (req, res) {
    Content.findById(req.params.id, function (err, content) {
        if (!err) {
            imagePath = content.coverimageURL;
            filepath = content.fileURL;

            fs.unlink(imagePath, (err) => {
                if (err) {
                    console.error(err)
                    return
                }
                console.log('Image file Removed')
            })

            fs.unlink(filepath, (err) => {
                if (err) {
                    console.error(err)
                    return
                }
                console.log('file Removed')
            })
        }
    });
    Content.findByIdAndRemove(req.params.id, (err, content) => {
        if (!err) {
            res.redirect('/contents/tables');
            console.log('Deleted Record', content);
        }
    });
});



module.exports = router;