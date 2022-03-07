const http = require('http');
const path = require('path');
const express = require('express');
const socketio = require('socket.io');
const Filter = require('bad-words');
const { generateMessage, generateLocationMessage } = require('./utils/messages');

const PORT = process.env.PORT || 3000
const publicDirPath = path.join(__dirname, '../public');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

app.use(express.static(publicDirPath));

io.on('connection', (socket) => {
  console.log('New WebSocket connection');

  socket.emit('message', generateMessage('Welcome'));
  socket.broadcast.emit('message', generateMessage('A new user has joined the chat'));

  socket.on('sendMessage', (message, callback) => {
    const filter = new Filter();
    if (filter.isProfane(message)) {
      return callback('Profanity is not allowed')
    }

    io.emit('message', generateMessage(message));
    callback();
  })

  socket.on('sendLocation', ({ latitude, longitude }, callback) => {
    io.emit('locationMessage', generateLocationMessage(latitude, longitude))

    callback();
  })

  socket.on('disconnect', () => {
    io.emit('message', generateMessage('A user has left'));
  })
})

server.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}!`);
})