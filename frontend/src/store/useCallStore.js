import { create } from "zustand";
import { useAuthStore } from "./useAuthStore";
import Peer from "simple-peer";

export const useCallStore = create((set, get) => ({
  // Call state
  isCallActive: false,
  isReceivingCall: false,
  caller: null,
  callerSignal: null,
  callType: null, // 'voice' or 'video'
  myStream: null,
  userStream: null,
  peer: null,

  // Actions
  startCall: async (userId, type) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: type === 'video',
        audio: true,
      });

      set({ myStream: stream, callType: type });

      const peer = new Peer({
        initiator: true,
        trickle: false,
        stream: stream,
      });

      peer.on("signal", (data) => {
        const socket = useAuthStore.getState().socket;
        socket.emit("callUser", {
          to: userId,
          from: useAuthStore.getState().authUser._id,
          signalData: data,
          type,
        });
      });

      peer.on("stream", (stream) => {
        set({ userStream: stream });
      });

      set({ peer, isCallActive: true });
    } catch (error) {
      console.error("Error starting call:", error);
    }
  },

  answerCall: async () => {
    try {
      const { callerSignal, callType } = get();
      const stream = await navigator.mediaDevices.getUserMedia({
        video: callType === 'video',
        audio: true,
      });

      set({ myStream: stream });

      const peer = new Peer({
        initiator: false,
        trickle: false,
        stream: stream,
      });

      peer.on("signal", (data) => {
        const socket = useAuthStore.getState().socket;
        socket.emit("answerCall", {
          to: get().caller,
          signalData: data,
        });
      });

      peer.on("stream", (stream) => {
        set({ userStream: stream });
      });

      peer.signal(callerSignal);
      set({ peer, isCallActive: true, isReceivingCall: false });
    } catch (error) {
      console.error("Error answering call:", error);
    }
  },

  endCall: () => {
    const { peer, myStream } = get();
    if (peer) {
      peer.destroy();
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
      peer: null,
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

    socket.on("callAccepted", (signal) => {
      const { peer } = get();
      if (peer) {
        peer.signal(signal);
      }
    });

    socket.on("callEnded", () => {
      get().endCall();
    });

    socket.on("iceCandidate", (candidate) => {
      const { peer } = get();
      if (peer) {
        peer.signal(candidate);
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
