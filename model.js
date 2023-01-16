const mongo = require('mongoose');

const persons = mongo.Schema({
    name:{type:String,required:true},
    relation:{
        rel_type:String,
        ref:Array
    }
});

module.exports = mongo.model('peoples',persons);