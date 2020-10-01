//modules
const path = require("path");
const http = require("http");
const express = require("express");

//utilities
const {
  joinUser,
  getCurrentUser,
  deleteUser,
  getRoomUsers,
  getAllUsersExceptCurrent,
} = require("./utils/user");
const { formatMessage } = require("./utils/message");

require("dotenv").config();

//consts
const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 3000;

const rooms = [];

app.set("view engine", "ejs");
app.set("views", "views");

//middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

//routes
app.use("/api/isRoomValid", (req, res, next) => {
  const roomname = req.body.roomname;
  const roomOption = req.body.roomOption;
  const index = rooms.findIndex((room) => room === roomname);
  if (roomOption === "create") {
    return res.json({ isValid: index === -1 ? true : false });
  } else if (roomOption === "join") {
    return res.json({ isValid: index > -1 ? true : false });
  }
});

app.use("/chat", (req, res, next) => {
  const username = req.query.username;
  const usercolor = req.query.usercolor;
  res.render("chat.ejs", {
    docname: "chat-page",
    username: username,
    usercolor: usercolor,
  });
});

app.use("/", (req, res, next) => {
  res.render("index.ejs", {
    docname: "chat-index",
    username: null,
    usercolor: null,
  });
});

//connection
const socketConnection = () => {
  let sockets = [];
  const io = require("socket.io")(server);
  io.on("connection", (socket) => {
    try {
      // to get total number of connected clients
      sockets.push(socket);
      console.log(`${sockets.length} users online`);

      //join room
      socket.on("joinRoom", ({ username, usercolor, roomname }) => {
        const user = joinUser(socket.id, username, usercolor, roomname);
        if (rooms.findIndex((room) => room === roomname) === -1)
          rooms.push(user.roomname);
        socket.join(user.roomname);
        io.to(user.roomname).emit("online users", getRoomUsers(user.roomname));
        console.log(rooms);
        // emit new user messagse
        socket.broadcast
          .to(user.roomname)
          .emit("new user", ` ${user.username} joined the chat`);
      });

      // let message;
      socket.on("chat message", ({ username, message }) => {
        const user = getCurrentUser(socket.id);
        io.to(user.roomname).emit(
          "chat message",
          formatMessage(username, message)
        );
      });

      // on client disconnect
      socket.on("disconnect", () => {
        const user = deleteUser(socket.id);
        const index = sockets.indexOf(socket);
        sockets = sockets.filter((s) => {
          if (sockets.indexOf(s) !== index) return s;
        });
        io.to(user.roomname).emit("online users", getRoomUsers(user.roomname));
        socket.broadcast
          .to(user.roomname)
          .emit("user leaves chat", `${user.username} has left the chat`);

        if (getRoomUsers(user.roomname).length === 0) {
          const index = rooms.findIndex((room) => room === user.roomname);
          rooms.splice(index, 1);
        }
        console.log(`${sockets.length} users online`);
      });
    } catch (err) {
      console.log(err);
    }
  });
};

socketConnection();

server.listen(PORT, () => {
  console.log(`server listening on ${PORT}`);
});
