import express from "express";
import morgan from "morgan";
import authRoutes from "../src/routes/auth.routes.js";
import cookieParser  from "cookie-parser";
import cors from "cors"



const app=express();
app.use(cors({
    origin: "http://localhost:5173",
    credentials:true
}))
app.use(express.json());
app.use(morgan("dev"));
app.use(cookieParser());
app.use("/api/auth", authRoutes);

export default app;