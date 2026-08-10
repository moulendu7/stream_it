const { io } = require("socket.io-client");

const socket = io("http://localhost:4000", {
  transports: ["websocket"],
});

socket.on("connect", () => {
  console.log("Client 2 connected:", socket.id);

  socket.emit("join-room", {
    roomId: "J6FAADDA",
    participantId: "7eabe05c-530e-452a-ba66-362654e3cb4a",
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