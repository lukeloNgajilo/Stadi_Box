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
    description: {
        type: String
    },
    createdAt: {
        type: String
    },
    grade: {
        type: String
    },
    postedBy: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }]


});

var Content = module.exports = mongoose.model('Content', Userschema);