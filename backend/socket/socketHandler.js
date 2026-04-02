import Message from '../models/messageModel.js';
import FamilyMember from '../models/familyMember.js';

// Simple helper for consistent socket errors
const emitSocketError = (socket, code, message) => {
  socket.emit('socket_error', { code, message });
};

export const initializeSocket = (io) => {
  io.on('connection', (socket) => {
    console.log('🔌 Socket connected:', socket.id);

    socket.data.lastMessageAt = 0;

    socket.on('join_story_feed', ({ circleId }) => {
      if (!circleId) return;
      
      // 🔥 Memory Leak rokne ka tareeka: Agar pehle se joined hai to do nothing
      const roomName = String(circleId);
      if (!socket.rooms.has(roomName)) {
        socket.join(roomName); 
        console.log(`🔌 Socket ${socket.id} joined story feed: ${roomName}`);
      }
    });

    socket.on('leave_story_feed', ({ circleId }) => {
      if (!circleId) return;
      socket.leave(String(circleId)); 
    });

    /**
     * 1) join_vault
     */
    socket.on('join_vault', async (payload) => {
      try {
        const { familyCircleId, userId, name } = payload || {};

        if (!familyCircleId || !userId) {
          return emitSocketError(
            socket,
            'BAD_PAYLOAD',
            'familyCircleId and userId are required'
          );
        }

        // 🔥 CHANGE: Ab backend sirf user ka naam nikalega, purana activeCircleId nahi.
        const user = await FamilyMember.findById(userId).select('_id name');

        if (!user) {
          return emitSocketError(socket, 'USER_NOT_FOUND', 'User not found');
        }

        // 🔥 BOUNCER FIXED: 'FORBIDDEN_ROOM' wali rukaawat yahan se uda di hai!

        socket.data.userId = user._id.toString();
        socket.data.name = name || user.name || 'Unknown User';
        socket.data.familyCircleId = String(familyCircleId);

        socket.join(String(familyCircleId));

        socket.emit('joined_vault', {
          message: 'Joined vault successfully',
          familyCircleId: String(familyCircleId),
        });

        socket.to(String(familyCircleId)).emit('member_joined', {
          userId: socket.data.userId,
          name: socket.data.name,
          at: new Date().toISOString(),
        });
      } catch (error) {
        return emitSocketError(socket, 'SERVER_ERROR', error.message);
      }
    });

    /**
     * 2) send_message
     */
    socket.on('send_message', async (payload) => {
      try {
        const { familyCircleId, senderId, senderName, text } = payload || {};

        if (!familyCircleId || !senderId || !text) {
          return emitSocketError(
            socket,
            'BAD_PAYLOAD',
            'familyCircleId, senderId, text are required'
          );
        }

        const cleanText = String(text).trim();
        if (!cleanText) {
          return emitSocketError(socket, 'EMPTY_MESSAGE', 'Message cannot be empty');
        }

        const now = Date.now();
        const diff = now - (socket.data.lastMessageAt || 0);
        if (diff < 1000) {
          return emitSocketError(
            socket,
            'RATE_LIMIT',
            'Please wait 1 second before sending next message'
          );
        }

        // 🔥 CHANGE: Yahan se bhi activeCircleId hataya.
        const sender = await FamilyMember.findById(senderId).select('_id name');
        if (!sender) {
          return emitSocketError(socket, 'USER_NOT_FOUND', 'Sender not found');
        }

        // 🔥 BOUNCER FIXED: Aur yahan se bhi doosri rukaawat uda di!

        socket.data.lastMessageAt = now;

        const newMessage = await Message.create({
          familyCircleId,
          sender: sender._id,
          senderName: senderName || sender.name || socket.data.name || 'Unknown User',
          text: cleanText,
        });

        io.to(String(familyCircleId)).emit('receive_message', {
          _id: newMessage._id,
          familyCircleId: newMessage.familyCircleId,
          sender: newMessage.sender,
          senderName: newMessage.senderName,
          text: newMessage.text,
          createdAt: newMessage.createdAt,
        });
      } catch (error) {
        return emitSocketError(socket, 'SERVER_ERROR', error.message);
      }
    });

    /**
     * 3) typing_start
     */
    socket.on('typing_start', (payload) => {
      try {
        const { familyCircleId, senderId, senderName } = payload || {};
        if (!familyCircleId || !senderId) return;

        socket.to(String(familyCircleId)).emit('member_typing', {
          senderId: String(senderId),
          senderName: senderName || socket.data.name || 'Unknown User',
        });
      } catch (error) {}
    });

    /**
     * 4) typing_stop
     */
    socket.on('typing_stop', (payload) => {
      try {
        const { familyCircleId, senderId } = payload || {};
        if (!familyCircleId || !senderId) return;

        socket.to(String(familyCircleId)).emit('member_stop_typing', {
          senderId: String(senderId),
        });
      } catch (error) {}
    });

    socket.on('leave_vault', (payload) => {
      try {
        const { familyCircleId } = payload || {};
        if (!familyCircleId) return;
        socket.leave(String(familyCircleId));
      } catch (error) {}
    });

    /**
     * 5) live_location_update
     */
    socket.on('live_location_update', (payload) => {
      try {
        const { familyCircleId, userId, latitude, longitude, updatedAt } = payload || {};

        if (!familyCircleId || !userId) {
          return emitSocketError(
            socket,
            'BAD_PAYLOAD',
            'familyCircleId and userId are required'
          );
        }

        io.to(String(familyCircleId)).emit('member_location_changed', {
          userId,
          latitude,
          longitude,
          updatedAt: updatedAt || new Date().toISOString(),
        });
      } catch (error) {
        return emitSocketError(socket, 'SERVER_ERROR', error.message);
      }
    });

    socket.on('disconnect', () => {
      console.log('❌ Socket disconnected:', socket.id);
    });
  });
};