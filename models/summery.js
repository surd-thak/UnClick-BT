const { string } = require('joi');
const mongoose= require('mongoose');
const Schema = mongoose.Schema;

const summerySchema = new Schema(
    {
        body:{
            type:String,
            required: true,
        },
        title: {
            type:String,
            required: true,
        },
        author:
        {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required:true,
        },
    }
)

module.exports = mongoose.model('Summery', summerySchema);