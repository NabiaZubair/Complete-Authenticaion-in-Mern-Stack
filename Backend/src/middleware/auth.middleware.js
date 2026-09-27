import jwt from "jsonwebtoken"
import config from "../config/config.js";

const authMiddleware = async (req, res, next) => {

    try {

        const accessToken = req.headers.authorization?.split(" ")[1]

        if (!accessToken) {
            return res.status(401).json({ message: "unotherized" })
        }

        const decoded = jwt.verify(accessToken, config.ACCESS);

        req.user = decoded;

        next();

    } catch (err) {

        return res.status(401).json({ message: "invalid or expired user" })
    }
}

export default authMiddleware;