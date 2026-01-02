import {create} from "zustand";
import toast from "react-hot-toast";
import {axiosInstance} from "../lib/axios"
import { useAuthStore } from "./useAuthStore";

export const  useChatStore=create((set,get)=>({

    messages:[],
    users:[],
    selectedUser:null,
    isUsersLoading:false,
    isMessagesLoading:false,

    getUsers:async()=>{
        set({isUsersLoading:true});
        try {
            const res=await axiosInstance.get("/messages/users");
            set({users:res.data});
        } catch (error) {
            toast.error(error.response.data.messages);
        }finally{
            set({isUsersLoading:false});
        }
    },//setter function

    getMessages:async(userId)=>{
        set ({isMessagesLoading:true});
        try {
            const res=await axiosInstance.get(`/messages/${userId}`);
            set({messages:res.data});
        } catch (error) {
            toast.error(error.response.data.messages);
        } finally{
            set({isMessagesLoading:false});
        }
    },//setter function

    sendMessage:async(messageData)=>{
        const{selectedUser,messages}=get();
        try {
            const res=await axiosInstance.post(`/messages/send/${selectedUser._id}`,messageData);
            set({messages:[...messages,res.data]});
        } catch (error) {
            toast.error(error.response.data.message);

        }
    },//setter function

    deleteMessage:async(messageId)=>{
        const{messages}=get();
        try {
            await axiosInstance.delete(`/messages/${messageId}`);
            set({messages:messages.filter(msg=>msg._id !== messageId)});
            toast.success("Message deleted");
        } catch (error) {
            toast.error(error.response.data.message);
        }
    },//setter function

    //optimized
    
    subscribeToMessages:()=>{
        const {selectedUser} = get();
        if (!selectedUser) return;

        const socket = useAuthStore.getState().socket; //get socket from useAuthStore
        //optimized here
        
        socket.on("newMessage", (newMessage) => {
            const isMessageSentFromSelectedUser =newMessage.senderId === selectedUser._id; //check if the new message is from the selected user
            if(!isMessageSentFromSelectedUser) return;
            set({
                messages: [...get().messages, newMessage],
            });
        });//listen to new message event

        socket.on("messageDeleted", (messageId) => {
            set({
                messages: get().messages.filter(msg => msg._id !== messageId),
            });
        });//listen to message deleted event
    },

    
    unsubscribeFromMessages:()=>{ //to avoid multiple event listeners
        const socket = useAuthStore.getState().socket; //get socket from useAuthStore
        socket.off("newMessage");
    },  
    
    setSelectedUser:(selectedUser)=>{
        set({selectedUser});
    },

    
}));