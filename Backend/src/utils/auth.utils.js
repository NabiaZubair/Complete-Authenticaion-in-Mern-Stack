import jwt from "jsonwebtoken"
import config from "../config/config.js";
import crypto from "crypto"

const ACCESS_TOKEN_EXPIRES="15m";
const REFRESH_TOKEN_EXPIRES="7d";

const accessToken=(userId)=>{
    return jwt.sign({
        id:userId
    },config.ACCESS,
    {
        expiresIn:ACCESS_TOKEN_EXPIRES
    }
);
};
const refreshToken=(userId)=>{
    return jwt.sign({                                  
        id:userId
    },config.REFRESH,      
    {
        expiresIn:REFRESH_TOKEN_EXPIRES
    }
);
};

const hashtoken=(token)=>{
    return crypto.createHash("sha256").update(token).digest("hex")
}

const setRefreshToken=(res,refreshToken)=>{
    res.cookie("refreshToken",refreshToken,{
        httpOnly:true,
        secure:config.NODE_ENV==="production",
        sameSite:"lax",
        maxAge:7*24*60*60*1000
    });
};

export {accessToken,refreshToken,hashtoken,setRefreshToken};