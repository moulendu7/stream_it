const { io } = require("socket.io-client");

const socket = io("http://localhost:4000", {
  transports: ["websocket"],
});

socket.on("connect", () => {
  console.log("Connected:", socket.id);

  socket.emit("join-room", {
    roomId: "J6FAADDA",
    participantId: "2449367b-dfd9-4585-a533-4698aa1c5043",
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
socket.on("participant-left", (data) => {
  console.log("Participant left:", data);
});
socket.on("disconnect", (reason) => {
  console.log("Disconnected:", reason);
});