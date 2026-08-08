const { io } = require("socket.io-client");

const socket = io("http://localhost:4000", {
  transports: ["websocket"],
});

socket.on("connect", () => {
  console.log("Connected:", socket.id);

  socket.emit("join-room", {
     roomId: "QA23367S",
  participantId: "abc",
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