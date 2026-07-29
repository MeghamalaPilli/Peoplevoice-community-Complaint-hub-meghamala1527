const mongoose = require("mongoose");

const villageSchema = new mongoose.Schema(
{
    name:{
        type:String,
        required:true,
        unique:true
    },

    mandal:{
        type:String,
        required:true
    },

    district:{
        type:String,
        required:true
    },

    pincode:{
        type:String,
        required:true
    },

    isActive:{
        type:Boolean,
        default:true
    }
},
{
    timestamps:true
});

module.exports = mongoose.model("Village", villageSchema);