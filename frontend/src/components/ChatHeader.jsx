import React from 'react'
import { useChatStore } from '../store/useChatStore'
import { useAuthStore } from '../store/useAuthStore';
import { useCallStore } from '../store/useCallStore';
import { X, Phone, Video } from 'lucide-react';

const ChatHeader = () => {
  const {selectedUser,setSelectedUser}=useChatStore();
  const {onlineUsers}=useAuthStore();
  const {startCall}=useCallStore();

  return (
    <div className="p-2.5 border-b border-base-300">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div className="avatar">
            <div className="size-10 rounded-full relative">
              <img src={selectedUser.profilepic || "./avatar.png"} alt={selectedUser.fullName}/>
            </div>
          </div>

          {/* User info */}
          <div>
            <h3 className="font-medium">{selectedUser.fullName}</h3>
            <p className="text-sm text-base-content/70">
              {onlineUsers.includes(selectedUser._id)?"Online":"Offline"}
            </p>
          </div>
        </div>

        {/* Call buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => startCall(selectedUser._id, 'voice')}
            className="btn btn-circle btn-ghost"
            disabled={!onlineUsers.includes(selectedUser._id)}
          >
            <Phone className="size-5" />
          </button>
          <button
            onClick={() => startCall(selectedUser._id, 'video')}
            className="btn btn-circle btn-ghost"
            disabled={!onlineUsers.includes(selectedUser._id)}
          >
            <Video className="size-5" />
          </button>
          <button onClick={()=>setSelectedUser(null)} className="btn btn-circle btn-ghost">
            <X/>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatHeader;