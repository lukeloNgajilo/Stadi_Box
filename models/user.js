const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

//monggose db connection
mongoose.connect('mongodb://localhost/lifeskills', {
    useNewUrlParser: true,
    useCreateIndex: true
});

var db = mongoose.connection;

const validator = require("validator");
//const jwt = require("jsonwebtoken");
const _ = require("lodash");


var Userschema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        index: true
    },
    password: {
        type: String,
        required: true,
    },
    email: {
        type: String,
    },
    name: {
        type: String
    },
    user_role: {
        type: String
    },
    joinedAt: {
        type: Number
    }
});

var User = module.exports = mongoose.model('User', Userschema);

module.exports.getUserById = function (id, callback) {
    User.findById(id, callback);
}

module.exports.getUserByUsername = function (username, callback) {
    var query = {
        username: username
    };

    User.findOne(query, callback);
}

module.exports.comparePassword = function (candidatePassword, hash, callback) {
    bcrypt.compare(candidatePassword, hash, function (err, isMatch) {
        callback(null, isMatch);
    });
}

module.exports.createUser = function (newUser, callback) {

    bcrypt.genSalt(10, function (err, salt) {
        bcrypt.hash(newUser.password, salt, function (err, hash) {
            newUser.password = hash;
            newUser.save(callback);
        });
    });
};