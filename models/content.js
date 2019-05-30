const mongoose = require("mongoose");

//monggose db connection
mongoose.connect('mongodb://localhost/lifeskills', {
    useNewUrlParser: true,
    useCreateIndex: true
});

var db = mongoose.connection;

var Userschema = new mongoose.Schema({
    title: {
        type: String
    },
    fileType: {
        type: String
    },
    topic: {
        type: String
    },
    grade: {
        type: Number
    },
    textSummary: {
        type: String
    },
    textDescription: {
        type: String
    },
    createdAt: {
        type: String
    },
    coverimageURL: {
        type: String
    },
    OriginalName: {
        type: String
    },
    mimeType: {
        type: String
    },
    fileURL: {
        type: String
    },
    uploadedBy: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    uploaderName: {
        type: String
    }
});

var Content = module.exports = mongoose.model('Content', Userschema);

module.exports.createContent = function (newContent, callback) {

    newContent.save(callback);
};

module.exports.getMaterials = function (callback) {
    Content.find(function (err, res) {
        if (!err) {
            callback(undefined, res);
        } else {
            console.log('error in retrieving the contents');
            callback(err);
        }
    });
};