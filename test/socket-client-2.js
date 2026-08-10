const { io } = require("socket.io-client");

const socket = io("http://localhost:4000", {
  transports: ["websocket"],
});

socket.on("connect", () => {
  console.log("Client 2 connected:", socket.id);

  socket.emit("join-room", {
    roomId: "NCXHQ7KE",
    participantId: "cc0bd2c8-ce92-4f7c-bfd5-fda332dbd6fe",
  });
});

socket.on("participant-joined", (data) => {
  console.log("Participant joined:", data);
});

socket.on("socket-error", (data) => {
  console.log("Socket error:", data);
});

socket.on("connect_error", (error) => {
  console.log("Connection error:", error.message);
});