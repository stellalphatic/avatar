import { useState, useRef, useEffect } from "react";
import { Room, RoomEvent, Track, ConnectionState } from "livekit-client";

export const useLiveKitConversation = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState("");
  const [error, setError] = useState("");
  const [callDuration, setCallDuration] = useState(0);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [messages, setMessages] = useState([]);

  const roomRef = useRef(null);
  const audioElementRef = useRef(null);
  const videoElementRef = useRef(null);
  const startTimeRef = useRef(null);
  const timerRef = useRef(null);
  const conversationIdRef = useRef(null);
  const agentJoinTimeoutRef = useRef(null);

  // Initialize audio element
  useEffect(() => {
    if (!audioElementRef.current) {
      audioElementRef.current = new Audio();
      audioElementRef.current.autoplay = true;
    }

    return () => {
      if (audioElementRef.current) {
        audioElementRef.current.pause();
        audioElementRef.current = null;
      }
    };
  }, []);

  // Call duration timer
  useEffect(() => {
    if (isConnected) {
      startTimeRef.current = Date.now();
      timerRef.current = setInterval(() => {
        const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
        setCallDuration(elapsed);
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      setCallDuration(0);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isConnected]);

  /**
   * Connect to LiveKit room
   */
  const connect = async ({
    token,
    wsUrl,
    roomName,
    conversationId,
    conversationType = "voice",
    metadata = {},
    onAvatarMessage,
  }) => {
    try {
      setIsConnecting(true);
      setConnectionStatus("Connecting to conversation service...");
      setError("");
      conversationIdRef.current = conversationId;

      // Validate token
      let tokenString;
      if (typeof token === "string") {
        tokenString = token.trim();
      } else if (token && typeof token === "object" && token.token) {
        tokenString = String(token.token).trim();
      } else {
        tokenString = String(token).trim();
      }

      if (
        !tokenString ||
        tokenString === "undefined" ||
        tokenString === "null" ||
        tokenString === "[object Object]"
      ) {
        throw new Error(`Invalid token format`);
      }

      if (!tokenString.startsWith("eyJ")) {
        throw new Error(`Token doesn't appear to be a valid JWT`);
      }

      console.log("[LiveKit] Connecting...", {
        wsUrl,
        roomName,
        tokenLength: tokenString.length,
        conversationType,
        metadata,
      });

      // Create room
      const room = new Room({
        adaptiveStream: true,
        dynacast: true,
        videoCaptureDefaults: {
          resolution: { width: 1280, height: 720, frameRate: 30 },
        },
        audioCaptureDefaults: {
          autoGainControl: true,
          echoCancellation: true,
          noiseSuppression: true,
        },
      });

      roomRef.current = room;

      // Connection state changes
      room.on(RoomEvent.ConnectionStateChanged, (state) => {
        console.log("[LiveKit] Connection state:", state);

        switch (state) {
          case ConnectionState.Connecting:
            setConnectionStatus("Connecting to room...");
            break;
          case ConnectionState.Connected:
            setConnectionStatus("Waiting for avatar...");
            break;
          case ConnectionState.Reconnecting:
            setConnectionStatus("Reconnecting...");
            setError("Connection lost, reconnecting...");
            break;
          case ConnectionState.Disconnected:
            setIsConnected(false);
            setConnectionStatus("");
            if (agentJoinTimeoutRef.current) {
              clearTimeout(agentJoinTimeoutRef.current);
            }
            break;
        }
      });

      // Track subscribed
      room.on(RoomEvent.TrackSubscribed, (track, publication, participant) => {
        console.log("[LiveKit] Track subscribed:", {
          kind: track.kind,
          participant: participant.identity,
        });

        if (track.kind === Track.Kind.Audio) {
          const audioElement = audioElementRef.current;
          if (audioElement) {
            track.attach(audioElement);
            console.log("[LiveKit] ✅ Audio attached");
          }
          setIsSpeaking(true);
        } else if (
          track.kind === Track.Kind.Video &&
          conversationType === "video"
        ) {
          const videoElement = videoElementRef.current;
          if (videoElement) {
            track.attach(videoElement);
            console.log("[LiveKit] ✅ Video attached");
          }
        }
      });

      // Track unsubscribed
      room.on(RoomEvent.TrackUnsubscribed, (track) => {
        if (track.kind === Track.Kind.Audio) {
          setIsSpeaking(false);
        }
        track.detach();
      });

      // Data received
      room.on(RoomEvent.DataReceived, (payload) => {
        try {
          const decoder = new TextDecoder();
          const message = JSON.parse(decoder.decode(payload));

          if (message.type === "transcript") {
            setMessages((prev) => [
              ...prev,
              {
                type: message.role === "user" ? "user" : "avatar",
                text: message.text,
                timestamp: Date.now(),
              },
            ]);

            if (onAvatarMessage && message.role === "assistant") {
              onAvatarMessage(message.text);
            }
          }
        } catch (error) {
          console.error("[LiveKit] Data parse error:", error);
        }
      });

      // Participant connected
      room.on(RoomEvent.ParticipantConnected, (participant) => {
        console.log("[LiveKit] Participant connected:", participant.identity);

        if (
          participant.identity.includes("agent") ||
          participant.identity.includes("worker")
        ) {
          if (agentJoinTimeoutRef.current) {
            clearTimeout(agentJoinTimeoutRef.current);
          }

          setIsConnected(true);
          setIsConnecting(false);
          setConnectionStatus("");
          setError("");

          setMessages((prev) => [
            ...prev,
            {
              type: "system",
              text: "Avatar connected! You can start speaking.",
              timestamp: Date.now(),
            },
          ]);
        }
      });

      // Participant disconnected
      room.on(RoomEvent.ParticipantDisconnected, (participant) => {
        console.log(
          "[LiveKit] Participant disconnected:",
          participant.identity
        );

        if (
          participant.identity.includes("agent") ||
          participant.identity.includes("worker")
        ) {
          setError("Avatar disconnected");
        }
      });

      // Room disconnected
      room.on(RoomEvent.Disconnected, (reason) => {
        console.log("[LiveKit] Disconnected:", reason);
        setIsConnected(false);
        setIsConnecting(false);
        setConnectionStatus("");
      });

      // Connect
      await room.connect(wsUrl, tokenString, {
        // ✅ Pass metadata to room
        metadata: JSON.stringify(metadata),
      });
      console.log("[LiveKit] ✅ Connected");

      // Enable microphone
      await room.localParticipant.setMicrophoneEnabled(true);
      console.log("[LiveKit] ✅ Microphone enabled");

      // Enable camera for video
      if (conversationType === "video") {
        await room.localParticipant.setCameraEnabled(true);
        console.log("[LiveKit] ✅ Camera enabled");
      }

      // Check for existing agent
      const existingParticipants = Array.from(room.remoteParticipants.values());
      const agentInRoom = existingParticipants.some(
        (p) => p.identity.includes("agent") || p.identity.includes("worker")
      );

      if (agentInRoom) {
        console.log("[LiveKit] Agent already in room");
        setIsConnected(true);
        setIsConnecting(false);
        setConnectionStatus("");
        setMessages([
          {
            type: "system",
            text: "Avatar is ready!",
            timestamp: Date.now(),
          },
        ]);
      } else {
        console.log("[LiveKit] Waiting for agent...");
        setConnectionStatus("Waiting for avatar to join...");

        // 30 second timeout
        agentJoinTimeoutRef.current = setTimeout(() => {
          if (!isConnected && roomRef.current) {
            console.error("[LiveKit] Agent join timeout");
            setError("Avatar failed to join. Please try again.");
            roomRef.current.disconnect();
          }
        }, 30000);
      }
    } catch (error) {
      console.error("[LiveKit] Connection error:", error);
      setError(`Failed to connect: ${error.message}`);
      setIsConnecting(false);
      setConnectionStatus("");

      if (roomRef.current) {
        await roomRef.current.disconnect();
        roomRef.current = null;
      }
    }
  };

  /**
   * Disconnect
   */
  const disconnect = async () => {
    try {
      console.log("[LiveKit] Disconnecting...");

      if (agentJoinTimeoutRef.current) {
        clearTimeout(agentJoinTimeoutRef.current);
      }

      if (roomRef.current) {
        await roomRef.current.disconnect();
        roomRef.current = null;
      }

      setIsConnected(false);
      setIsConnecting(false);
      setConnectionStatus("");
      setIsSpeaking(false);
      setError("");

      return {
        conversationId: conversationIdRef.current,
        durationMinutes: callDuration / 60,
      };
    } catch (error) {
      console.error("[LiveKit] Disconnect error:", error);
      return null;
    }
  };

  /**
   * Toggle microphone
   */
  const toggleMicrophone = async () => {
    if (roomRef.current) {
      const enabled = roomRef.current.localParticipant.isMicrophoneEnabled;
      await roomRef.current.localParticipant.setMicrophoneEnabled(!enabled);
      return !enabled;
    }
    return false;
  };

  /**
   * Toggle camera
   */
  const toggleCamera = async () => {
    if (roomRef.current) {
      const enabled = roomRef.current.localParticipant.isCameraEnabled;
      await roomRef.current.localParticipant.setCameraEnabled(!enabled);
      return !enabled;
    }
    return false;
  };

  /**
   * Send message
   */
  const sendMessage = async (text) => {
    if (roomRef.current && text.trim()) {
      const message = {
        type: "user_message",
        text: text.trim(),
        timestamp: Date.now(),
      };

      const encoder = new TextEncoder();
      const data = encoder.encode(JSON.stringify(message));

      await roomRef.current.localParticipant.publishData(data, {
        reliable: true,
      });

      setMessages((prev) => [
        ...prev,
        {
          type: "user",
          text: text.trim(),
          timestamp: Date.now(),
        },
      ]);
    }
  };

  return {
    isConnected,
    isConnecting,
    connectionStatus,
    error,
    callDuration,
    isSpeaking,
    messages,
    audioElementRef,
    videoElementRef,
    connect,
    disconnect,
    toggleMicrophone,
    toggleCamera,
    sendMessage,
  };
};
