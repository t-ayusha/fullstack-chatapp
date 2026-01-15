import React, { useEffect, useRef, useState } from 'react';
import { useCallStore } from '../store/useCallStore';
import { X, Phone, PhoneOff, Mic, MicOff, Video as VideoIcon, VideoOff } from 'lucide-react';

const CallModal = () => {
  const {
    isCallActive,
    isReceivingCall,
    caller,
    callType,
    myStream,
    userStream,
    answerCall,
    endCall,
  } = useCallStore();

  const myVideoRef = useRef();
  const userVideoRef = useRef();
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);

  useEffect(() => {
    if (myStream && myVideoRef.current) {
      myVideoRef.current.srcObject = myStream;
    }
  }, [myStream]);

  useEffect(() => {
    if (userStream && userVideoRef.current) {
      userVideoRef.current.srcObject = userStream;
    }
  }, [userStream]);

  const toggleMute = () => {
    if (myStream) {
      const audioTrack = myStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMuted(!audioTrack.enabled);
      }
    }
  };

  const toggleVideo = () => {
    if (myStream) {
      const videoTrack = myStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoOff(!videoTrack.enabled);
      }
    }
  };

  if (!isCallActive && !isReceivingCall) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-base-100 rounded-lg p-6 max-w-md w-full mx-4">
        {isReceivingCall && (
          <div className="text-center">
            <h3 className="text-lg font-semibold mb-4">Incoming {callType} Call</h3>
            <p className="mb-6">Call from {caller}</p>
            <div className="flex justify-center gap-4">
              <button
                onClick={answerCall}
                className="btn btn-success btn-circle"
              >
                <Phone className="size-6" />
              </button>
              <button
                onClick={() => useCallStore.getState().setReceivingCall(null, null, null)}
                className="btn btn-error btn-circle"
              >
                <PhoneOff className="size-6" />
              </button>
            </div>
          </div>
        )}

        {isCallActive && (
          <div className="text-center">
            <h3 className="text-lg font-semibold mb-4">
              {callType === 'video' ? 'Video' : 'Voice'} Call
            </h3>

            {callType === 'video' && (
              <div className="relative mb-4">
                <video
                  ref={userVideoRef}
                  autoPlay
                  className="w-full h-48 bg-black rounded-lg object-cover"
                />
                <video
                  ref={myVideoRef}
                  autoPlay
                  muted
                  className="absolute top-2 right-2 w-20 h-20 bg-black rounded-lg object-cover border-2 border-white"
                />
              </div>
            )}

            <div className="flex justify-center gap-4 mb-4">
              <button
                onClick={toggleMute}
                className={`btn btn-circle ${isMuted ? 'btn-error' : 'btn-ghost'}`}
              >
                {isMuted ? <MicOff className="size-5" /> : <Mic className="size-5" />}
              </button>

              {callType === 'video' && (
                <button
                  onClick={toggleVideo}
                  className={`btn btn-circle ${isVideoOff ? 'btn-error' : 'btn-ghost'}`}
                >
                  {isVideoOff ? <VideoOff className="size-5" /> : <VideoIcon className="size-5" />}
                </button>
              )}

              <button
                onClick={endCall}
                className="btn btn-error btn-circle"
              >
                <PhoneOff className="size-5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CallModal;
