import mongoose  from "mongoose";
import bcrypt from "bcrypt"

const userSchema = new mongoose.Schema({

    username: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        select: false
    },
    googleId:{
        type:String,
        unique:true,
        sparse:true

    },
    authProvider:{
        type:String,
        enum:["local","google"],
        default:"local"
    },
    isVerified:{
        type:Boolean,
        default:false
    }
}, {
    timestamps: true
}

);

//hash password befor saving
userSchema.pre("save",async function () {
    if(!this.isModified("password")){
        return 
    }

    this.password=await bcrypt.hash(this.password,10)
    
    
});

//verify password 
userSchema.methods.comparePassword=async function (password) {
    return await bcrypt.compare(password,this.password)

}

const userModel = mongoose.model("user", userSchema)

export default userModel