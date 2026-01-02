import cloudinary from "../lib/cloudinary.js";
import { generateToken } from "../lib/utils.js";
import User from "../models/user.model.js"
import bcrypt from "bcryptjs"
export const signup =async (req,res)=>{
    //res.send("signup route");
    const{fullName,email,password}=req.body
    try{
        console.log(fullName,email,password);
        if(!fullName || !password || !email){
            return res.status(400).json({message:"All fields are required"});
        }
        //hash password by a package called bycrpt
        if(password.length<6){
            return res.status(400).json({message:"Password must be atleast 6 characters"});
        }

        //to check if that email is already in it
        const user=await User.findOne({email})
        if(user) return res.status(400).json({message:"Email already exists"});

        //now hash
        const salt =await bcrypt.genSalt(10) //genSalt mean generate salt 
        const hashedPassword = await bcrypt.hash(password,salt)

        //create new user
        const newUser= new User({
            fullName,
            email,
            password:hashedPassword,
        })

        if(newUser){
            //generate jwt token cookie here
            generateToken(newUser._id,res)
            await newUser.save();

            res.status(201).json({
                _id:newUser._id,
                fullName:newUser.fullName,
                email:newUser.email,
                profilepic:newUser.profilepic,
            });
        }
        else{
            res.status(400).json({message:"Invalid user data"});

        }
    }
    catch(error){
        console.log("Error in signup controller",error.message);
        res.status(500).json({message:"Internal server error"});
    }
};

export const login= async(req,res)=>{
    //res.send("login route");
    const {email,password }= req.body; //req.bodyto get the email and password
    try {
        const user = await User.findOne({email});
        if(!user){
            return res.status(400).json({message:"Invalid credentials"});
        }
        const isPasswordCorrect=await bcrypt.compare(password,user.password)//user.password is the value from database
        if(!isPasswordCorrect){
            return res.status(400).json({ message:"Invalid credentials"});
        }
        generateToken(user._id,res)

        res.status(200).json({
                _id:user._id,
                fullName:user.fullName,
                email:user.email,
                profilepic:user.profilepic,
        })
    } catch (error) {
        console.log("Error in login controller", error.message);
        res.status(500).json({message:"Internal Server Error"})
    }
};

export const logout=(req,res)=>{
    //res.send("logout route");
    try {
        res.cookie("jwt","",{maxAge:0});
        res.status(200).json({message:"Loggedout successfully"});
    } catch (error) {
        console.log("Error in logout controller",error.message);
        res.status(500).json({message:"Internal Server Error"})
        
    }
};
export const updateprofile=async(req,res)=>{
    //service that is needed to upload images into
    try {
        console.log("req.user:", req.user);
        console.log("req.body.profilepic length:", req.body.profilepic?.length);

        const {profilepic}=req.body;//user sends through profilepic and it is caught ny req.body
        const userId=req.user._id //req can access _id as it was given in the protectroute

        if(!profilepic){
            return res.status(400).json({message:"Profile pic required"})
        }
        const uploadresponse=await cloudinary.uploader.upload(profilepic)
        console.log("Cloudinary upload response:", uploadresponse);
        const updateduser=await User.findByIdAndUpdate(userId,{profilepic:uploadresponse.secure_url},{new:true}) //new part updates the user and gives to updateduser
        res.status(200).json(updateduser)

    } catch (error) {
        console.log("error in update profile",error);
        res.status(500).json({message:"Internal server error"});
    }
}

export const checkauth=(req,res)=>{
    try {
        res.status(200).json(req.user);

    } catch (error) {
        console.error("error in checkauth controller:",error.message);
        res.status(500).json({message:"Internal server error"});
    }
}

export const deleteAccount = async (req, res) => {
    try {
        const userId = req.user._id;

        // Delete user from database
        await User.findByIdAndDelete(userId);

        // Clear the JWT cookie
        res.cookie("jwt", "", { maxAge: 0 });

        res.status(200).json({ message: "Account deleted successfully" });
    } catch (error) {
        console.error("Error in deleteAccount controller:", error.message);
        res.status(500).json({ message: "Internal server error" });
    }
};
