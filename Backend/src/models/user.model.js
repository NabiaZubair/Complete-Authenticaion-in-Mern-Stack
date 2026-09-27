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
        required: true,
        select: false
    },
    isVarified:{
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