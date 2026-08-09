const { io } = require("socket.io-client");

const socket = io("http://localhost:4000", {
  transports: ["websocket"],
});

socket.on("connect", () => {
  console.log("Connected:", socket.id);

  socket.emit("join-room", {
    roomId: "Y68HZGN3",
    participantId: "40f4ae09-9584-4961-8890-4cb452ecad3b",
  });
});

socket.on("socket-error", (data) => {
  console.log("Socket error:", data);
});

socket.on("connect_error", (error) => {
  console.log("Connection error:", error.message);
});

socket.on("disconnect", (reason) => {
  console.log("Disconnected:", reason);
});