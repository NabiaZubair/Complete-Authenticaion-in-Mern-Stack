import nodemailer from "nodemailer"

import config from "../config/config.js"

const transporter=nodemailer.createTransport({
    service:"gmail",
    auth:{
        user:config.EMAIL,
        pass:config.EMAIL_PASSWORD
    }
});

export const sendOTPEmail= async(email,otp)=>{
    await transporter.sendMail({
        from:config.EMAIL,
        to:email,
        subject:"varify you account",
        text:`your varification otp is ${otp}. it will expire in 10 minute`
    })
}