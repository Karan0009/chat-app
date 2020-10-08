const messageList = document.querySelector(".message-list");
const messagesBox = document.querySelector(".messages-box");
const usersListEl = document.querySelector(".users-list");
const leaveButton = document.querySelector(".leave-chat-button");

let socket = io();
let users = [];
//chat ui functions

const getParamFromUrl = (paramName) => {
  const url = window.location.href;
  let params = url.split("?")[1];
  params = params.split("&");
  params = params.map((param) => {
    const paramName = param.split("=")[0];
    const paramValue = param.split("=")[1];
    return { paramName, paramValue };
  });
  const index = params.findIndex((param) => {
    if (param.paramName == paramName) return param;
  });

  if (index > -1) return params[index].paramValue;
  else return null;
};

const getDataFromUrlAndCreateUser = () => {
  const username = getParamFromUrl("username");
  const usercolor = getParamFromUrl("usercolor");
  const roomname = getParamFromUrl("roomname");
  if (
    !username ||
    username === "" ||
    !usercolor ||
    usercolor === "" ||
    !roomname ||
    roomname === ""
  )
    window.location.href = "http://localhost:3000/";
  else return { username, usercolor, roomname };
};

const selectUser = (e) => {
  const receiver = e.target.innerHTML;
  // socket.emit("joinRoom", { userInfo, receiver });
};

const outputMessage = (sender, msg) => {
  const div = document.createElement("div");
  div.classList = "message";
  if (sender)
    div.innerHTML = `<p class="message__username">${sender}</p>
  <p class="message__text">${msg}`;
  else
    div.innerHTML = `<p class="message__username"></p>
  <p class="message__text">${msg}`;
  messagesBox.appendChild(div);
  return div;
};

const outputOnlineUsers = (usersList) => {
  usersListEl.innerHTML = "";
  usersList.forEach((user) => {
    const li = document.createElement("li");
    li.classList = "users-list__item";
    li.innerHTML = user.username;
    usersListEl.appendChild(li);
  });
};

//create user
const userInfo = getDataFromUrlAndCreateUser();

//to set the color in nav
window.onload = () => {
  url = window.location.href;
  const userColorEl = document.querySelector(".user-color-nav");
  userColorEl.style.background = "#" + getParamFromUrl("usercolor");
};

//join user in room
socket.emit("joinRoom", {
  username: userInfo.username,
  usercolor: userInfo.usercolor,
  roomname: userInfo.roomname,
});

$(function () {
  //send message to server
  $(".message-info-form").submit(function (e) {
    let receiver = $(".message-info-form__receiver").val();
    let message = $(".message-info-form__message").val();
    e.preventDefault(); // prevents page reloading
    socket.emit("chat message", { username: userInfo.username, message });
    $(".message-info-form__receiver").val("");
    $(".message-info-form__message").val("");
    return false;
  });

  // catches that a new user has joined the chat
  socket.on("new user", (msg) => {
    console.log("new user joined");
    const div = outputMessage(null, msg);
    messagesBox.scrollTop = messagesBox.scrollHeight + div.scrollHeight;
  });

  // catches user leaves the chat
  socket.on("user leaves chat", (msg) => {
    console.log("a user leaves chat");
    const div = outputMessage(null, msg);
    messagesBox.scrollTop = messagesBox.scrollHeight + div.scrollHeight;
  });

  // catches chat message
  socket.on("chat message", (data) => {
    console.log(data);
    const div = outputMessage(data.username, data.message);
    messagesBox.scrollTop = messagesBox.scrollHeight + div.scrollHeight;
  });

  socket.on("online users", (onlineUsers) => {
    console.log(onlineUsers, onlineUsers.length, "updated");
    const usersList = onlineUsers.filter(
      (user) => user.username !== userInfo.username
    );
    users = usersList;
    outputOnlineUsers(usersList);
  });
});

leaveButton.addEventListener("click", () => {
  outputOnlineUsers(users);
});
