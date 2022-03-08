const http = require('http');
const path = require('path');
const express = require('express');
const socketio = require('socket.io');
const Filter = require('bad-words');

const { generateMessage, generateLocationMessage } = require('./utils/messages');
const { addUser, removeUser, getUser, getUsersInRoom } = require('./utils/users');

const PORT = process.env.PORT || 3000
const publicDirPath = path.join(__dirname, '../public');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

app.use(express.static(publicDirPath));

io.on('connection', (socket) => {
  console.log('New WebSocket connection');


  socket.on('join', ({ username, room }, callback) => {
    const {error, user} = addUser({ id: socket.id, username, room });

    if (error) {
      return  callback(error)
    }

    socket.join(user.room);

    socket.emit('message', generateMessage('Server','Welcome'));
    socket.broadcast.to(user.room).emit('message', generateMessage('Server', `${user.username} has joined!`));

    callback()
  });

  socket.on('sendMessage', (message, callback) => {
    const user = getUser(socket.id);
    if (user) {
      const filter = new Filter();
      if (filter.isProfane(message)) {
        return callback('Profanity is not allowed')
      }

      io.to(user.room).emit('message', generateMessage(user.username, message));
      callback();
    }
  })

  socket.on('sendLocation', ({ latitude, longitude }, callback) => {
    const user = getUser(socket.id);

    if (user) {
      io.to(user.room).emit('locationMessage', generateLocationMessage(user.username, latitude, longitude))

      callback();
    }

  })

  socket.on('disconnect', () => {
    const user = removeUser(socket.id);

    if (user) {
      io.to(user.room).emit('message', generateMessage('Server', `${user.username} has left`));
    }
  })
})

server.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}!`);
})