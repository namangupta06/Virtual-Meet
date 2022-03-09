const io = require("socket.io")(8900, {
  cors: {
    origin: "http://localhost:3000",
  },
});

let users = [];

const peerUsers = {};
const socketToRoom = {};

const addUser = (userId, socketId) => {
  !users.some((user) => user.userId === userId) &&
    users.push({ userId, socketId });
};

const removeUser = (socketId) => {
  users = users.filter((user) => user.socketId !== socketId);
};

const getUser = (userId) => {
  return users.find((user) => user.userId === userId);
};

io.on("connection", (socket) => {
  console.log("user is connected...");

  socket.emit("me", socket.id);

  socket.on("addUser", (userId) => {
    addUser(userId, socket.id);
    io.emit("getUsers", users);
  });

  socket.on("sendMessage", ({ senderId, senderName, message }) => {
    io.local.emit("getMessage", {
      senderId,
      senderName,
      message,
    });
  });

  //for individual call
  socket.on("callfriend", ({ userToCall, signalData, from, name }) => {
    const friend = getUser(userToCall);
    io.to(friend.socketId).emit("callfriend", {
      signal: signalData,
      from,
      name
    });
  });

  socket.on("callanswered", (data) => {
    io.to(data.to).emit("callanswered", data.signal);
  });

  socket.on("endcall", ({ userToendCall }) => {
    const friend = getUser(userToendCall);
    io.to(friend.socketId).emit("endcall");
  })

  socket.on("callDeclined", ({ calldeclineId }) => {
    const friend = getUser(calldeclineId);
    io.to(friend.socketId).emit("callDeclined");
  })

  //for video chat with multiple people
  socket.on("join room", roomID => {
    if (peerUsers[roomID]) {
      const length = peerUsers[roomID].length;
      if (length === 20) {
        socket.emit("room full");
        return;
      }
      peerUsers[roomID].push(socket.id);
    } else {
      peerUsers[roomID] = [socket.id];
    }
    socketToRoom[socket.id] = roomID;
    const usersInThisRoom = peerUsers[roomID].filter(id => id !== socket.id);

    socket.emit("all users", usersInThisRoom);
  });

  socket.on("sending signal", payload => {
    io.to(payload.userToSignal).emit('user joined', { signal: payload.signal, callerID: payload.callerID });
  });

  socket.on("returning signal", payload => {
    io.to(payload.callerID).emit('receiving returned signal', { signal: payload.signal, id: socket.id });
  });

  socket.on("call ended", () => {
    const roomId = socketToRoom[socket.id];
    let room = peerUsers[roomId];
    if (room) {
      room = room.filter(id => id != socket.id)
      peerUsers[roomId] = room;
    }
    socket.broadcast.emit('user left', socket.id);
  })

  socket.on("disconnect", () => {
    console.log("a user disconnected!");
    removeUser(socket.id);
    io.emit("getUsers", users);
  });
});
