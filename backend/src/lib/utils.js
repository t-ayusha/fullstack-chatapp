import jwt from "jsonwebtoken"; //package that allow us to handle authentication
export const generateToken=(userId,res)=>{
    const token= jwt.sign({userId},process.env.JWT_SECRET,{
        expiresIn:"7d"
    }) //jwt.signto create token

    res.cookie("jwt",token,{
        maxAge: 7*24*60*60*1000, // age of token in ms 
        httpOnly:true,//prevent XSS attacks (cross-site scripting attacks)
        sameSite:"strict",//CSRF attacks(cross-site request forgery attacks)
        secure: process.env.NODE_ENV!=="development"
    }); //jwt is the cookie name
    return token;
}