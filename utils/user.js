let users = [];

function joinUser(id, username, usercolor, roomname) {
  const user = { id, username, usercolor, roomname };
  users.push(user);
  return user;
}

function getCurrentUser(id) {
  return users.find((user) => user.id === id);
}

function deleteUser(id) {
  const index = users.findIndex((user) => user.id === id);

  if (index !== -1) return users.splice(index, 1);
}

function getRoomUsers(roomname) {
  return users.filter((user) => user.roomname === roomname);
}

function getAllUsersExceptCurrent(id) {
  const result = users.filter((user) => user.id !== id);
  return result;
}

module.exports = {
  joinUser,
  getCurrentUser,
  getAllUsersExceptCurrent,
  deleteUser,
  getRoomUsers,
};
