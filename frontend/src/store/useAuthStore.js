import { create } from "zustand";
import { axiosInstance } from "../lib/axios.js";
import toast from "react-hot-toast";
import {io } from "socket.io-client";

const BASE_URL=import.meta.env.MODE==="development"?"http://localhost:5001":"/"; //to differentiate between dev and prod

export const useAuthStore=create((set,get)=>({
    authUser:null, //as we dont know if user is authenticated or no

    isSigningUp:false ,//initially false
    isLogginIn:false,
    isUpdatingProfile:false,

    isCheckingAuth:true,//as when we one a page it will 1st check the user auth or not
    onlineUsers:[],
    socket:null,

    checkAuth:async()=>{
        try {
            const res=await axiosInstance.get("/auth/check"); //as it is always top of axios no need for /api
            set({authUser:res.data});
            get().connectSocket(); //connect socket after checking auth
        } catch (error) {
            console.log("Error in checkAuth:",error)
            set({authUser:null})
        }
        finally{
            set({isCheckingAuth:false})
        }
    },

    signup:async(data)=>{
        set({isSigningUp:true});
        try {
            const res=await axiosInstance.post("/auth/signup",data); //data is the form data
            set({authUser:res.data}); //set the user data
            toast.success("Account created successfully!");
            get().connectSocket(); //connect socket after signup
            
        } catch (error) {
            toast.error(error.response.data.message || "Something went wrong during signup");
        }finally{
            set({isSigningUp:false});
        }
    },//setter function

    login:async(data)=>{
        set({isLoggingIn:true});
        try {
            const res=await axiosInstance.post("/auth/login",data);
            set({authUser:res.data});
            toast.success("Logged in successfully!");

            get().connectSocket(); //connect socket after login
        } catch (error) {
            toast.error(error.response.data.message);
        }finally{
            set({isLogginIn:false});
        }
    },

    logout:async()=>{
        try {
            await axiosInstance.post("/auth/logout");
            set({authUser:null});
            toast.success("Logged out successfully!");
            get().disconnectSocket();
        } catch (error) {
            toast.error(error.response.data.message);
        }
    },

    updateProfile:async(data)=>{
         set({isUpdatingProfile:true});
         try {
            console.log(data)
            const res= await axiosInstance.put("/auth/update-profile",data,{withCredentials:true});
            set({authUser:res.data});
            toast.success("Updated sucessfullyy!!")
         } catch (error) {
            console.log("error in updating:",error);
            toast.error(error.response.data.message);            
         }finally{
            set({isUpdatingProfile:false});
         }
    },

    connectSocket:()=>{
        const {authUser}=get();
        if(!authUser || get().socket?.connected) return; //if no auth user or socket is already connected then return
        const socket=io(BASE_URL,{
            query:{
                userId:authUser._id //send userId as query param to identify the user where userId is key and authUser._id is value
            }
        });

        set({socket:socket});

        socket.on("getOnlineUsers",(userIds)=>{
            set({onlineUsers:userIds});
        })
    },

    disconnectSocket:()=>{
        if(get().socket?.connected) get().socket.disconnect();
    },
})) 