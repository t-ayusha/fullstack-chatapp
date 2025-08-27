//import express
//const express= require("express") //"express" is the package
import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";

import path from "path";

import authRoutes from "./routes/auth.route.js";
import messageRoutes from "./routes/message.route.js";

import {connectDB} from "./lib/db.js"
import { app,server } from "./lib/socket.js";
dotenv.config() //to access env
//create express app
// const app=express();   it is removed s it is created in socket.js and exported

const PORT=process.env.PORT;//process.env -to access everything inside the env

const __dirname=path.resolve();

//app.use(express.json());//to extract data in json format
app.use(cookieParser());//to parse the cookie
app.use(cors({
    origin:"http://localhost:5173",
    credentials:true,
}));//allow cookies with the request

app.use(express.json({ limit: '10mb' })); // or more if needed
app.use(express.urlencoded({ limit: '10mb', extended: true })); // in case you use urlencoded


app.use("/api/auth",authRoutes); //authRoutes is inside routes used for user authentication
app.use("/api/messages",messageRoutes);

if(process.env.NODE_ENV==="production"){
    app.use(express.static(path.join(__dirname,"../frontend/dist/index.html"))); //middleware to serve static files or production files
    
    
    app.get("*",(req,res)=>{ //for any route
        
        res.sendFile(path.join(__dirname,"../frontend","dist","index.html")); //send index.html file for any route
    })

}

server.listen(PORT,()=>{
    console.log("server is running on PORT:"+PORT);
    connectDB();
})
