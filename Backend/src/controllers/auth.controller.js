import userModel from "../models/user.model.js"
import emailOTP from "../models/otp.model.js"
import sessionModel from "../models/session.model.js"
import passwordResetToken from "../models/passwordResetToken.js"

import { registerSchema, loginSchema } from "../validator/auth.validator.js"
import { accessToken, refreshToken, setRefreshToken, hashtoken } from "../utils/auth.utils.js"
import { generateOTP, hashOTP } from "../utils/otp.utils.js"
import config from "../config/config.js"
import { sendOTPEmail } from "../service/email.service.js"

import jwt from "jsonwebtoken"
import crypto from "crypto";
import bcrypt from "bcrypt"

import { OAuth2Client } from "google-auth-library"

const googleClient = new OAuth2Client(
    process.env.GOOGLE_CLIENT_ID
)

async function googleLogin(req, res) {
    try {
        const { credential } = req.body

        if(!credential){
            return res.status(400).json({
                message:"google credentials are required"
            })
        }

        const ticket= await googleClient.verifyIdToken({
            idToken:credential,
            audience:process.env.GOOGLE_CLIENT_ID
        })

        const payload=ticket.getPayload();

        const{sub:googleId,email,name,picture,email_verified}=payload

        if(!email_verified){
            return res.status(400).json({
                message:"email is not verified"
            })
        }

         console.log("Google user:",payload)

        let user=await userModel.findOne({googleId})
       
        if(!user){
             user= await userModel.findOne({email})
        }

        if(user){
            if(!user.googleId){
                user.googleId=googleId;
                user.authProvider="google"
                await user.save()
            }
        }

        if(!user){
           user=await userModel.create ({
            username:name,
            email:email,
            googleId:googleId,
              authProvider: "google"
           })
        }
        
        const newAccessToken = accessToken(user._id);
        const newRefreshToken = refreshToken(user._id);

        const refreshTokenHash = hashtoken(newRefreshToken)

        const session = await sessionModel.create({
            user: user._id,
            refreshTokenHash,
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            userAgent: req.get("user-agent") || "unknown",
            ip: req.ip

        })

        setRefreshToken(res, newRefreshToken)

        res.status(200).json({
            message: "you have been loged successfully",
            accessToken: newAccessToken,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
            }
        })

    } catch (error) {
        console.log(error)
        return res.status(500).json({
            message:"google authentication failed"
        })

    }
}

async function registerUser(req, res) {

    try {

        const result = registerSchema.safeParse(req.body)

        if (!result.success) {
            return res.status(400).json({
                message: "invalid input",
                errors: result.error.issues
            })
        }

        const { username, email, password } = result.data

        //check if user already exist 
        const existUser = await userModel.findOne({
            $or: [
                { email },
                { username }
            ]
        })

        if (existUser) {
            return res.status(409).json({ message: "user already exist " })
        }

        //create user
        const user = await userModel.create({
            username,
            email,
            password
        })

        //genrate otp
        const otp = generateOTP();

        //hash otp
        const otpHash = hashOTP(otp);

        await emailOTP.create({
            user: user._id,
            otpHash,
            expiresAt: new Date(Date.now() + 10 * 60 * 1000)
        });

        await sendOTPEmail(email, otp)
        return res.status(201).json({
            message: "account create otp send to your email",
            userId: user._id
        })

    } catch (err) {
        console.log(err);
        return res.status(500).json({
            message: "server error"
        })
    }

}

async function emailVerify(req, res) {
    try {
        const { userId, otp } = req.body;

        //find otp
        const otpRecord = await emailOTP.findOne({
            user: userId
        })

        if (!otpRecord) {
            return res.status(400).json({
                message: "otp not found"
            });
        }

        //check expiration 
        if (otpRecord.expiresAt < new Date()) {
            await emailOTP.deleteOne({
                _id: otpRecord._id
            });
            return res.status(400).json({
                message: "otp expired"
            })
        }

        //check attempst 
        if (otpRecord.attempts >= 5) {
            return res.status(429).json({
                message: "too many attempts .request a new otp"
            })
        }

        //hash entered otp
        const otpHash = hashOTP(otp);

        //compare 
        if (otpHash !== otpRecord.otpHash) {
            otpRecord.attempts += 1;
            await otpRecord.save();
            return res.status(400).json({
                message: "invalid otp"
            })
        }

        //find user 
        const user = await userModel.findById(userId);

        if (!user) {
            return res.status(404).json({
                messsage: "user not found"
            })
        }

        //varify account
        user.isVerified = true;

        await user.save();

        //delet otp 
        await emailOTP.deleteOne({
            _id: otpRecord._id
        });

        //create jwt
        const newAccessToken = accessToken(user._id)
        const newRefreshToken = refreshToken(user._id)

        const refreshTokenHash = hashtoken(newRefreshToken)

        const session = await sessionModel.create({
            user: user._id,
            refreshTokenHash,
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            userAgent: req.get("user-agent") || "unknown",
            ip: req.ip

        })

        setRefreshToken(res, newRefreshToken)

        res.status(201).json({
            message: "you have been registered successfully",
            accessToken: newAccessToken,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
            }
        })

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            message: "Server error"
        });
    }
};

async function resendOTP(req, res) {
    try {
        const { userId } = req.body;

        // 1. Find user
        const user = await userModel.findById(userId);

        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }

        // 2. If already verified, don't send another OTP
        if (user.isVerified) {
            return res.status(400).json({
                message: "Email is already verified"
            });
        }

        // 3. Generate new OTP
        const otp = generateOTP();

        // 4. Hash OTP before storing
        const otpHash = hashOTP(otp);

        // 5. Delete previous OTP
        await emailOTP.deleteMany({
            user: user._id
        });

        // 6. Save new OTP
        await emailOTP.create({
            user: user._id,
            otpHash,
            expiresAt: new Date(Date.now() + 10 * 60 * 1000)
        });

        // 7. Send new OTP
        await sendOTPEmail(user.email, otp);

        return res.status(200).json({
            message: "New OTP sent to your email"
        });

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            message: "Failed to resend OTP"
        });
    }
}

async function loginUser(req, res) {

    try {
        const result = loginSchema.safeParse(req.body)

        if (!result.success) {
            return res.status(400).json({
                message: "invalid input",
                errors: result.error.issues
            })
        }

        const { email, password } = result.data

        const user = await userModel.findOne({ email }).select("+password");

        if (!user) {
            return res.status(401).json({
                message: "invalid email or password..."
            });
        }

        const isMatch = await user.comparePassword(password);

        if (!isMatch) {
            return res.status(401).json({
                message: "invalid email or password"
            });
        }

        if (!user.isVerified) {
            return res.status(403).json({
                message: "Email is not verified",
                userId: user._id
            });
        }

        const newAccessToken = accessToken(user._id);
        const newRefreshToken = refreshToken(user._id);

        const refreshTokenHash = hashtoken(newRefreshToken)

        const session = await sessionModel.create({
            user: user._id,
            refreshTokenHash,
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            userAgent: req.get("user-agent") || "unknown",
            ip: req.ip

        })

        setRefreshToken(res, newRefreshToken)

        res.status(200).json({
            message: "you have been loged successfully",
            accessToken: newAccessToken,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
            }
        })

    } catch (err) {
        console.log(err)
        return res.status(500).json({
            message: "server error"
        })
    }
}

async function forgetPassword(req, res) {
    try {
        const { email } = req.body

        const user = await userModel.findOne({ email })

        if (!user) {
            return res.status(200).json({
                message: "if user exist with this email,a reset otp has been sent"
            })
        }

        await passwordResetToken.deleteMany({
            user: user._id
        })

        // 3. Generate new OTP
        const otp = generateOTP();

        // 4. Hash OTP before storing
        const otpHash = hashOTP(otp);

        await passwordResetToken.create({
            user: user._id,
            otpHash,
            expiresAt: new Date(Date.now() + 10 * 60 * 1000)
        })

        await sendOTPEmail(user.email, otp);

        return res.status(200).json({
            message:
                "If an account exists with this email, a reset OTP has been sent.",
        });

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            message: "Something went wrong",
        });
    }
}

async function verifyOtp(req, res) {
    try {
        const { email, otp } = req.body

        const user = await userModel.findOne({ email })

        if (!user) {
            return res.status(400).json({
                message: "invalid or expired reset request"
            })
        }

        const resetRecord = await passwordResetToken.findOne({
            user: user._id,
            usedAt: null,
            expiresAt: { $gt: new Date() }

        })

        if (!resetRecord) {
            return res.status(400).json({
                message: "invalid or expired otp"
            })
        }

        if (resetRecord.attemptes >= 5) {
            return res.status(429).json({
                message: "too many request. request a new otp"
            })
        }

        //hash entered otp
        const otpHash = hashOTP(otp);

        //compare 
        if (otpHash !== resetRecord.otpHash) {
            resetRecord.attemptes += 1;
            await resetRecord.save();
            return res.status(400).json({
                message: "invalid otp"
            })
        }


        const resetToken = crypto.randomBytes(32).toString("hex");
        const resetTokenHash = crypto.createHash("sha256").update(resetToken).digest("hex")

        resetRecord.resetTokenHash = resetTokenHash
        resetRecord.resetTokenExpiresAt = new Date(Date.now() + 10 * 60 * 1000)

        await resetRecord.save()

        return res.status(200).json({
            message: "otp is verified successfully",
            resetToken
        })
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            message: "server error"
        })
    }
}

async function resetPassword(req, res) {

    const { newPassword, resetToken } = req.body;
    try {
        const resetTokenHash = crypto.createHash("sha256").update(resetToken).digest("hex")

        const resetTokenRecord = await passwordResetToken.findOne({
            resetTokenHash,
            usedAt: null,
            resetTokenExpiresAt: { $gt: new Date() }
        })

        if (!resetTokenRecord) {
            return res.status(400).json({
                message: "invalid or expired reset token"
            })
        }

        const user = await userModel.findById(resetTokenRecord.user)

        if (!user) {
            return res.status(400).json({
                message: "user not found"
            })
        }

        user.password = newPassword;
        await user.save();

        resetTokenRecord.usedAt = new Date()
        await resetTokenRecord.save()

        return res.status(200).json({
            message: "password reset successfully"
        })

    } catch (error) {
        console.log(error)
        return res.status(500).json({
            message: "sever error"
        })
    }

}

async function refreshAccessToken(req, res) {

    try {

        const oldRefreshToken = req.cookies.refreshToken;

        if (!oldRefreshToken) {
            return res.status(401).json({
                message: "unotherized"
            })
        }

        const decoded = jwt.verify(oldRefreshToken, config.REFRESH);

        const tokenHash = hashtoken(oldRefreshToken)

        const session = await sessionModel.findOne({
            user: decoded.id,
            refreshTokenHash: tokenHash,
            revokedAt: null,
            expiresAt: {
                $gt: new Date()
            }
        })

        if (!session) {
            return res.status(401).json({
                message: "invalid session"
            })
        }
        session.revokedAt = new Date();

        await session.save();

        const newAccessToken = accessToken(decoded.id);

        const newRefreshToken = refreshToken(decoded.id);

        const newTokenHash = hashtoken(newRefreshToken);

        await sessionModel.create({
            user: decoded.id,
            refreshTokenHash: newTokenHash,
            expiresAt: new Date(
                Date.now() + 7 * 24 * 60 * 60 * 1000),
            userAgent: req.get("user-agent") || "unknown",
            ip: req.ip

        })

        setRefreshToken(res, newRefreshToken)

        return res.status(200).json({
            accessToken: newAccessToken
        })

    } catch (err) {
        console.log(err)
        return res.status(401).json({
            message: "invalid or expired token"
        })
    }
}

async function logoutUser(req, res) {
    try {

        const refreshTokenFromCookies = req.cookies.refreshToken;

        if (refreshTokenFromCookies) {

            const tokenHash = hashtoken(refreshTokenFromCookies)

            await sessionModel.findOneAndUpdate(
                {
                    refreshTokenHash: tokenHash,
                    revokedAt: null
                },
                {
                    revokedAt: new Date()
                }
            )
        }

        res.clearCookie("refreshToken", {
            httpOnly: true,
            secure: config.NODE_ENV === "production",
            sameSite: "lax"
        })

        return res.status(200).json({
            message: "log out successfully"
        })

    } catch (err) {
        console.log(err);
        res.status(500).json({
            message: "something went wrong"
        })

    }
}

async function logoutAllDevices(req, res) {
    try {

        const userId = req.user.id;

        await sessionModel.updateMany(
            {
                user: userId,
                revokedAt: null
            },
            {
                revokedAt: new Date()
            }
        )

        res.clearCookie("refreshToken", {
            httpOnly: true,
            secure: config.NODE_ENV === "production",
            sameSite: "lax"
        })

        return res.status(200).json({
            message: "log out successfully"
        })

    } catch (err) {
        console.log(err);
        res.status(500).json({
            message: "something went wrong"
        })
    }
}

async function getMe(req, res) {
    try {
        res.status(200).json({
            message: "user fetched successfuly",
            user: req.user
        })
    } catch (error) {
        res.status(500).json({
            message: "internal server Error"
        })
    }

}

export {
    registerUser, emailVerify, loginUser,
    logoutUser, getMe, refreshAccessToken,
    logoutAllDevices, resendOTP, forgetPassword,
    verifyOtp, resetPassword,googleLogin
}