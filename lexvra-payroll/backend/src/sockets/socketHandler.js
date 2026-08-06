const socketIo = require('socket.io');

let io;

// Map to track online users: userId -> socketId
const onlineUsers = new Map();

const initSocket = (server) => {
  io = socketIo(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST']
    }
  });

  io.on('connection', (socket) => {
    console.log(`[Socket Connected]: ${socket.id}`);

    // User joins global app space (for presence and notifications)
    socket.on('join_user_room', (userId) => {
      socket.join(`user_${userId}`);
      onlineUsers.set(userId, socket.id);
      
      // Notify all clients that this user is online
      io.emit('user_online_status', { userId, status: 'ONLINE' });
      
      // Send the current list of online users to the newly connected user
      socket.emit('online_users_list', Array.from(onlineUsers.keys()));
      console.log(`User ${userId} joined notification room`);
    });

    // Chat specific events
    socket.on('join_chat', (conversationId) => {
      socket.join(`chat_${conversationId}`);
    });

    socket.on('leave_chat', (conversationId) => {
      socket.leave(`chat_${conversationId}`);
    });

    socket.on('typing', ({ conversationId, userName, userId }) => {
      socket.to(`chat_${conversationId}`).emit('user_typing', { conversationId, userName, userId });
    });

    socket.on('stop_typing', ({ conversationId, userId }) => {
      socket.to(`chat_${conversationId}`).emit('user_stopped_typing', { conversationId, userId });
    });

    socket.on('mark_as_read', ({ messageId, conversationId, userId }) => {
      // Broadcast that this message was read
      socket.to(`chat_${conversationId}`).emit('message_read_receipt', { messageId, conversationId, userId });
    });

    socket.on('disconnect', () => {
      console.log(`[Socket Disconnected]: ${socket.id}`);
      
      // Find and remove disconnected user
      let disconnectedUserId = null;
      for (let [userId, socketId] of onlineUsers.entries()) {
        if (socketId === socket.id) {
          disconnectedUserId = userId;
          onlineUsers.delete(userId);
          break;
        }
      }

      if (disconnectedUserId) {
        io.emit('user_online_status', { userId: disconnectedUserId, status: 'OFFLINE' });
      }
    });
  });

  return io;
};

const getIO = () => {
  if (!io) {
    throw new Error('Socket.io not initialized!');
  }
  return io;
};

module.exports = { initSocket, getIO };
