const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const uniqueValidator = require('mongoose-unique-validator');

let testSchema = new Schema({
    name: {
        type: String
    },
    test:{
        type:String,
        unique: true,
        text: true
    },
    note:{
        type: Number
    },
    profile:{
        type:String
    }

    },{
        collection:'tests'
})

testSchema.plugin(uniqueValidator, { message: 'Ce test existe deja!' });
module.exports = mongoose.model('Test', testSchema)