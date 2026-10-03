import jwt from "jsonwebtoken"
import config from "../config/config.js";
import userModel from "../models/user.model.js";

const authMiddleware = async (req, res, next) => {

    try {

        const accessToken = req.headers.authorization?.split(" ")[1]

        if (!accessToken) {
            return res.status(401).json({ message: "unotherized" })
        }

        const decoded = jwt.verify(accessToken, config.ACCESS);
        const user= await userModel.findById(decoded.id).select("-password")

        if(!user){
            return res.status(404).json({
                message:"user not found"
            });
        }

        req.user = user;

        next();

    } catch (err) {

        return res.status(401).json({ message: "invalid or expired user" })
    }
}

export default authMiddleware;