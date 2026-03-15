import Message from '../models/messageModel.js';

export const initializeSocket = (io) => {
  io.on('connection', (socket) => {
    console.log('🔌 Socket connected:', socket.id);

    /**
     * 1) join_vault
     * client payload: { familyCircleId, userId, name }
     */
    socket.on('join_vault', async (payload) => {
      try {
        const { familyCircleId, userId, name } = payload || {};

        if (!familyCircleId || !userId) {
          socket.emit('socket_error', { message: 'familyCircleId and userId are required' });
          return;
        }

        // store basic info in socket session
        socket.data.userId = userId;
        socket.data.name = name || 'Unknown User';
        socket.data.familyCircleId = familyCircleId;

        // join isolated room
        socket.join(String(familyCircleId));

        socket.emit('joined_vault', {
          message: 'Joined vault successfully',
          familyCircleId,
        });

        // notify other members in room
        socket.to(String(familyCircleId)).emit('member_joined', {
          userId,
          name: socket.data.name,
          at: new Date().toISOString(),
        });
      } catch (error) {
        socket.emit('socket_error', { message: error.message });
      }
    });

    /**
     * 2) send_message
     * client payload: { familyCircleId, senderId, senderName, text }
     */
    socket.on('send_message', async (payload) => {
      try {
        const { familyCircleId, senderId, senderName, text } = payload || {};

        if (!familyCircleId || !senderId || !text) {
          socket.emit('socket_error', { message: 'familyCircleId, senderId, text are required' });
          return;
        }

        // save in DB
        const newMessage = await Message.create({
          familyCircleId,
          sender: senderId,
          senderName: senderName || socket.data.name || 'Unknown User',
          text: String(text).trim(),
        });

        // broadcast to same room only
        io.to(String(familyCircleId)).emit('receive_message', {
          _id: newMessage._id,
          familyCircleId: newMessage.familyCircleId,
          sender: newMessage.sender,
          senderName: newMessage.senderName,
          text: newMessage.text,
          createdAt: newMessage.createdAt,
        });
      } catch (error) {
        socket.emit('socket_error', { message: error.message });
      }
    });

    /**
     * 3) live_location_update (socket-side direct event)
     * client payload: { familyCircleId, userId, latitude, longitude, updatedAt }
     * Note: REST controller se bhi emit karenge (best practice)
     */
    socket.on('live_location_update', (payload) => {
      try {
        const { familyCircleId, userId, latitude, longitude, updatedAt } = payload || {};

        if (!familyCircleId || !userId) {
          socket.emit('socket_error', { message: 'familyCircleId and userId are required' });
          return;
        }

        io.to(String(familyCircleId)).emit('member_location_changed', {
          userId,
          latitude,
          longitude,
          updatedAt: updatedAt || new Date().toISOString(),
        });
      } catch (error) {
        socket.emit('socket_error', { message: error.message });
      }
    });

    socket.on('disconnect', () => {
      console.log('❌ Socket disconnected:', socket.id);
    });
  });
};