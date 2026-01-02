import User from "../models/user.model.js";
import Message from "../models/message.model.js";
import cloudinary from "../lib/cloudinary.js";
import { io,getReceiverSocketId } from "../lib/socket.js";

export const getUsersForSidebar=async(req,res)=>{
    try {
        const loggedInUserId=req.user._id;  
        const filteredUsers=await User.find({_id:{$ne:loggedInUserId}}).select("-password"); //$ne is used as not equal to

        res.status(200).json(filteredUsers);
    } catch (error) {
        console.error("Error in getUsersForSidebar:",error.message);
        res.status(500).json({error:"Internal server error"});
    }
};

export const getMessages=async(req,res)=>{
    try {
        const { id:userToChatId }=req.params
        const myId=req.user._id; //sender

        const messages = await Message.find({
            //chats between that person and the sender
            $or:[
                {senderId:myId,receiverId:userToChatId},
                {senderId:userToChatId,receiverId:myId}
            ]
        })
        res.status(200).json(messages);
    } catch (error) {
        console.log("Errorin getMessages controller: ",error.message);
        res.status(500).json({error:"Internal error"});
    }
};

export const sendMessage=async(req,res)=>{
    try {
        const { text,image}=req.body;
        const { id:receiverId}=req.params;
        const senderId=req.user._id;

        let imageUrl;
        //check if there is an image
        if(image){
            const uploadresponse=await cloudinary.uploader.upload(image);
            imageUrl=uploadresponse.secure_url;
        }

        const newMessage=new Message({
            senderId,
            receiverId,
            text,
            image:imageUrl,
        });
        await newMessage.save();
        //realtime functionality goes here =>socket.io
        const receiverSocketId= getReceiverSocketId(receiverId); //get socketId of receiver
        if(receiverSocketId){
            io.to(receiverSocketId).emit("newMessage",newMessage);
        } //emit to only that user

        res.status(201).json(newMessage)
    } catch (error) {
        console.log("Error inmessage controller: ",error.message);
        res.status(500).json({error:"Internal server error"});
    }
};

export const deleteMessage=async(req,res)=>{
    try {
        const { id:messageId }=req.params;
        const userId=req.user._id;

        const message=await Message.findById(messageId);
        if(!message){
            return res.status(404).json({error:"Message not found"});
        }

        if(message.senderId.toString() !== userId.toString()){
            return res.status(403).json({error:"You can only delete your own messages"});
        }

        await Message.findByIdAndDelete(messageId);

        // Emit to receiver for real-time update
        const receiverSocketId= getReceiverSocketId(message.receiverId);
        if(receiverSocketId){
            io.to(receiverSocketId).emit("Message Deleted",messageId);
        }

        res.status(200).json({message:"Message deleted successfully"});
    } catch (error) {
        console.log("Error in deleteMessage controller: ",error.message);
        res.status(500).json({error:"Internal server error"});
    }
};
