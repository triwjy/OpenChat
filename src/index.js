const http = require('http');
const path = require('path');
const express = require('express');
const socketio = require('socket.io');
const Filter = require('bad-words');

const PORT = process.env.PORT || 3000
const publicDirPath = path.join(__dirname, '../public');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

app.use(express.static(publicDirPath));

let newMessage = 'Welcome';

io.on('connection', (socket) => {
  console.log('New WebSocket connection');

  socket.emit('message', newMessage);
  socket.broadcast.emit('message', 'A new user has joined the chat');

  socket.on('sendMessage', (message, callback) => {
    const filter = new Filter();
    if (filter.isProfane(message)) {
      return callback('Profanity is not allowed')
    }

    io.emit('message', message);
    callback();
  })

  socket.on('sendLocation', ({ latitude, longitude }, callback) => {
    let mapURL = `https://google.com/maps?q=${latitude},${longitude}`
    io.emit('locationMessage', mapURL)

    callback();
  })

  socket.on('disconnect', () => {
    io.emit('message', 'A user has left');
  })
})

server.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}!`);
})