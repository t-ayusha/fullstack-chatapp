import { create } from "zustand";
import { useAuthStore } from "./useAuthStore";

export const useCallStore = create((set, get) => ({
  // Call state
  isCallActive: false,
  isReceivingCall: false,
  caller: null,
  callerSignal: null,
  callType: null, // 'voice' or 'video'
  myStream: null,
  userStream: null,
  peerConnection: null,
  localDescription: null,

  // Actions
  startCall: async (userId, type) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: type === 'video',
        audio: true,
      });

      set({ myStream: stream, callType: type });

      const peerConnection = new RTCPeerConnection({
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' }
        ]
      });

      // Add local stream tracks to peer connection
      stream.getTracks().forEach(track => {
        peerConnection.addTrack(track, stream);
      });

      // Handle remote stream
      peerConnection.ontrack = (event) => {
        set({ userStream: event.streams[0] });
      };

      // Handle ICE candidates
      peerConnection.onicecandidate = (event) => {
        if (event.candidate) {
          const socket = useAuthStore.getState().socket;
          socket.emit("iceCandidate", {
            to: userId,
            candidate: event.candidate,
          });
        }
      };

      // Create offer
      const offer = await peerConnection.createOffer();
      await peerConnection.setLocalDescription(offer);

      set({ peerConnection, isCallActive: true });

      // Send offer via socket
      const socket = useAuthStore.getState().socket;
      socket.emit("callUser", {
        to: userId,
        from: useAuthStore.getState().authUser._id,
        signalData: offer,
        type,
      });

    } catch (error) {
      console.error("Error starting call:", error);
    }
  },

  answerCall: async () => {
    try {
      const { callerSignal, callType, caller } = get();
      const stream = await navigator.mediaDevices.getUserMedia({
        video: callType === 'video',
        audio: true,
      });

      set({ myStream: stream });

      const peerConnection = new RTCPeerConnection({
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' }
        ]
      });

      // Add local stream tracks to peer connection
      stream.getTracks().forEach(track => {
        peerConnection.addTrack(track, stream);
      });

      // Handle remote stream
      peerConnection.ontrack = (event) => {
        set({ userStream: event.streams[0] });
      };

      // Handle ICE candidates
      peerConnection.onicecandidate = (event) => {
        if (event.candidate) {
          const socket = useAuthStore.getState().socket;
          socket.emit("iceCandidate", {
            to: caller,
            candidate: event.candidate,
          });
        }
      };

      // Set remote description (offer)
      await peerConnection.setRemoteDescription(new RTCSessionDescription(callerSignal));

      // Create answer
      const answer = await peerConnection.createAnswer();
      await peerConnection.setLocalDescription(answer);

      set({ peerConnection, isCallActive: true, isReceivingCall: false });

      // Send answer via socket
      const socket = useAuthStore.getState().socket;
      socket.emit("answerCall", {
        to: caller,
        signalData: answer,
      });

    } catch (error) {
      console.error("Error answering call:", error);
    }
  },

  endCall: () => {
    const { peerConnection, myStream } = get();
    if (peerConnection) {
      peerConnection.close();
    }
    if (myStream) {
      myStream.getTracks().forEach(track => track.stop());
    }
    const socket = useAuthStore.getState().socket;
    socket.emit("endCall", { to: get().caller });

    set({
      isCallActive: false,
      isReceivingCall: false,
      caller: null,
      callerSignal: null,
      callType: null,
      myStream: null,
      userStream: null,
      peerConnection: null,
      localDescription: null,
    });
  },

  setReceivingCall: (caller, signal, type) => {
    set({
      isReceivingCall: true,
      caller,
      callerSignal: signal,
      callType: type,
    });
  },

  subscribeToCalls: () => {
    const socket = useAuthStore.getState().socket;

    socket.on("callIncoming", (data) => {
      const { from, signalData, type } = data;
      get().setReceivingCall(from, signalData, type);
    });

    socket.on("callAccepted", async (signal) => {
      const { peerConnection } = get();
      if (peerConnection) {
        await peerConnection.setRemoteDescription(new RTCSessionDescription(signal));
      }
    });

    socket.on("callEnded", () => {
      get().endCall();
    });

    socket.on("iceCandidate", (candidate) => {
      const { peerConnection } = get();
      if (peerConnection) {
        peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
      }
    });
  },

  unsubscribeFromCalls: () => {
    const socket = useAuthStore.getState().socket;
    socket.off("callIncoming");
    socket.off("callAccepted");
    socket.off("callEnded");
    socket.off("iceCandidate");
  },
}));
