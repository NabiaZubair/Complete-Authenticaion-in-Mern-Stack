import mongoose from "mongoose";

const emailOTPSchema=new mongoose.Schema(
    {
        user:{
         type:mongoose.Schema.Types.ObjectId,
         ref:"user",
         required:true
        },
        otpHash:{
            type:String,
            required:true
        },
        expiresAt:{
            type:Date,
            required:true
        },
        attempts:{
            type:Number,
            default:0
        }
    },

    {
        timestamps:true
    }
);

const emailOTP=mongoose.model("enterOTP",emailOTPSchema);

export default emailOTP;