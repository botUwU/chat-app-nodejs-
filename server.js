const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static("public"));
const users = {};
io.on("connection", (socket) => {
  console.log("new user connected to server", socket.id);
  socket.on("login", (username, callback) => {
    if (Object.values(users).some((user) => user.username === username)) {
      callback({ success: false, message: "Username already in use" });
    } else {
      const color = `#${Math.floor(Math.random() * 16777215).toString(16)}`;
      users[socket.id] = { username, color };
      callback({ success: true, username, color, users: Object.values(users) });
      io.emit("update users", Object.values(users));
    }
  });

  socket.on("chat message", (msg) => {
    const user = users[socket.id];
    if (user) {
      io.emit("chat message", {
        msg,
        username: user.username,
        color: user.color,
      });
    }
  });
  socket.on("disconnect", () => {
    console.log("A user disconnected");
    delete users[socket.id];
    io.emit("update uers", Object.values(users));
  });
});

server.listen(3000, () => {
  console.log("server is running on port 3000");
});
