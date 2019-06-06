const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

//monggose db connection
mongoose.connect('mongodb://localhost/lifeskills', {
    useNewUrlParser: true,
    useCreateIndex: true
});

var db = mongoose.connection;

const validator = require("validator");
const _ = require("lodash");


var Downloadschema = new mongoose.Schema({
    contentId: {
        type: String,
    },
    downloaderId: {
        type: String,
    },
    contentName: {
        type: String,
    },
    downloaderName: {
        type: String
    },
    downloaderSchool: {
        type: String
    },
    Date: {
        type: String
    }
});


var Download = module.exports = mongoose.model('Download', Downloadschema);