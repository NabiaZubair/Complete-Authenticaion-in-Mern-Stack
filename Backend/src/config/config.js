import dotenv from "dotenv"

dotenv.config();

if(!process.env.MONGO_URI){
    throw new ("mongo uri is not defined in  enviromental variable")
}

const config={
    MONGO_URI: process.env.MONGO_URI,
    ACCESS:process.env.ACCESS_JWT_SECRET,
    REFRESH:process.env.REFRESH_JWT_SECRET,
    NODE_ENV:process.env.NODE_ENV,
    EMAIL:process.env.EMAIL,
    EMAIL_PASSWORD:process.env.EMAIL_PASSWORD
}

export default config