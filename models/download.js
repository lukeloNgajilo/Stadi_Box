const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

//monggose db connection
mongoose.connect('mongodb://localhost/lifeskills', {
    useNewUrlParser: true,
    useCreateIndex: true
});

var db = mongoose.connection;

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
    date: {
        type: String
    }
});


var Download = module.exports = mongoose.model('Download', Downloadschema);

module.exports.createDownload = function (newDownload, callback) {

    newDownload.save(callback);

};

module.exports.getDownloads = function (callback) {
    Download.find(function (err, res) {
        if (!err) {
            callback(undefined, res);
        } else {
            console.log('error in retrieving downloads');
            callback(err);
        }
    });
};