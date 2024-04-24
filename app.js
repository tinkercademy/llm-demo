const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');
const { v4: uuidv4 } = require('uuid');  // UUID library to generate unique codes

const app = express();
// Serve static files from the 'public' directory
app.use(express.static('public'));

const server = http.createServer(app);
const io = socketIo(server);

// Map to store codes and associated socket room
const codeRoomMap = new Map();

io.on('connection', (socket) => {
  console.log('A user connected');

  socket.on('wordFromClient', (data) => {
    console.log('Word from client', data);
    socket.broadcast.emit('submitWordToMaster', data);
  });

  socket.on('createRoom', () => {
    let newCode = uuidv4().slice(0, 4);  // Generate a short unique code
    codeRoomMap.set(newCode, socket.id);
    socket.emit('roomCreated', newCode);
    socket.join(newCode);
  });

  socket.on('joinRoom', (code) => {
    if (codeRoomMap.has(code)) {
      socket.join(code);
      socket.emit('joinedRoom', code);
    } else {
      socket.emit('error', 'Invalid Code');
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected');
  });

});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
