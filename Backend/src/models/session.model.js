import mongoose from "mongoose"

const sessionSchema=new mongoose.Schema({
    user:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"user",
    required:true,
    index:true
    },
    refreshTokenHash:{
        type:String,
        required:true,
        unique:true
    },
    revokedAt:{
        type:Date,
        default:null
    },
       expiresAt: {
            type: Date,
            required: true
        },
    userAgent:{
        type:String,
        required:true
    },
    ip:{
        type:String,
        required:true
    }
},{
    timestamps:true
}
);

const sessionModel= mongoose.model("session",sessionSchema)
export default sessionModel;