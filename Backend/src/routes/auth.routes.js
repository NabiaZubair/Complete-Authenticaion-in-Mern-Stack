import {Router} from "express";
import { registerUser, emailVerify,loginUser,logoutUser ,refreshAccessToken,getMe,
    logoutAllDevices,resendOTP,forgetPassword,resetPassword, verifyOtp,googleLogin} from "../controllers/auth.controller.js";
import authMiddleware from "../middleware/auth.middleware.js";

const authRoutes=Router();

authRoutes.post("/google-login",googleLogin)
authRoutes.post("/register",registerUser);
authRoutes.post("/email-verify",emailVerify);
authRoutes.post("/resend-otp",resendOTP);
authRoutes.post("/forget-password",forgetPassword)
authRoutes.post("/verify-otp",verifyOtp)
authRoutes.post("/reset-password",resetPassword)
authRoutes.post("/login",loginUser);
authRoutes.get("/refresh-token",refreshAccessToken);
authRoutes.post("/logout",authMiddleware,logoutUser);
authRoutes.post("/logout-all",authMiddleware,logoutAllDevices)
authRoutes.get("/get-me",authMiddleware,getMe)


export default authRoutes