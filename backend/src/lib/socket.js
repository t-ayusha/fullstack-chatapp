import {Server} from "socket.io";
import http from "http";
import express from "express";


const app=express();
const server=http.createServer(app);

const io=new Server(server,{
    cors:{
        origin:["http://localhost:5173"]
    }
});

export function getReceiverSocketId(userId){
    return userSocketMap[userId];
}//to get socketId of a user

const userSocketMap={}; //to store which user is connected to which socket also used to store online users

io.on("connection",(socket)=>{
    console.log("A user is connected ",socket.id);

    const userId=socket.handshake.query.userId; //get userId from query params
    if(userId) userSocketMap[userId]=socket.id; //map userId to socket.id

    //io.emit() is used to send event to all connected clients
    io.emit("getOnlineUsers",Object.keys(userSocketMap)); //emit to all users about online users


    socket.on("disconnect",()=>{
        console.log("A user is disconnected ",socket.id);

        delete userSocketMap[userId]; //remove user from userSocketMap on disconnect
        io.emit("getOnlineUsers",Object.keys(userSocketMap)); //emit to all users
    });
});

export {io, app,server};