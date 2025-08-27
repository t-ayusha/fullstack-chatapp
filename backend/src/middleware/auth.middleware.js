import jwt from "jsonwebtoken" // needed to validate token
import User from"../models/user.model.js";

export const protectRoute=async(req,res,next)=>{
    try {
        const token=req.cookies.jwt;
        if(!token){
            return res.status(401).json({message:"Unauthorized-No token provided"});
        }
        const decoded=jwt.verify(token,process.env.JWT_SECRET);
        
        if(!decoded){
            return res.status(401).json({message:"Unauthorized- token invalid"});
        }

        const user=await User.findById(decoded.userId).select("-password");//deselctedthe password
        
        //to make it robust and clean
        if(!user){
            return res.status(404).json({message:"User not found"});
        }

        req.user=user;
        next() //here it will go back to route then it will go to updateprofile

    } catch (error) {
        console.log("Error in protectRoute middleware:",error.message);
        res.status(500).json({message:"Internal error"});
    }
}