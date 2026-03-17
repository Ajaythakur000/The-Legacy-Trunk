import Message from '../models/messageModel.js';
import FamilyMember from '../models/familyMember.js';

// Simple helper for consistent socket errors
const emitSocketError = (socket, code, message) => {
  socket.emit('socket_error', { code, message });
};

export const initializeSocket = (io) => {
  io.on('connection', (socket) => {
    console.log('🔌 Socket connected:', socket.id);

    // Basic in-memory spam control (per socket)
    // We keep timestamp of last sent message
    socket.data.lastMessageAt = 0;

    /**
     * 1) join_vault
     * payload: { familyCircleId, userId, name }
     *
     * Security:
     * - userId must exist in DB
     * - requested familyCircleId must match user's activeCircleId
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

        // DB user check
        const user = await FamilyMember.findById(userId).select(
          '_id name activeCircleId'
        );

        if (!user) {
          return emitSocketError(socket, 'USER_NOT_FOUND', 'User not found');
        }

        // Security check: user can only join own active vault
        if (
          !user.activeCircleId ||
          user.activeCircleId.toString() !== String(familyCircleId)
        ) {
          return emitSocketError(
            socket,
            'FORBIDDEN_ROOM',
            'You are not allowed to join this vault'
          );
        }

        // Save user context on socket session
        socket.data.userId = user._id.toString();
        socket.data.name = name || user.name || 'Unknown User';
        socket.data.familyCircleId = String(familyCircleId);

        // Join isolated room
        socket.join(String(familyCircleId));

        socket.emit('joined_vault', {
          message: 'Joined vault successfully',
          familyCircleId: String(familyCircleId),
        });

        // Inform other room members
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
     * payload: { familyCircleId, senderId, senderName, text }
     *
     * Added checks:
     * - sender belongs to same vault
     * - anti-spam cooldown (1 message / second)
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

        // anti-spam: 1 message per 1000 ms
        const now = Date.now();
        const diff = now - (socket.data.lastMessageAt || 0);
        if (diff < 1000) {
          return emitSocketError(
            socket,
            'RATE_LIMIT',
            'Please wait 1 second before sending next message'
          );
        }

        // verify sender in DB + room ownership
        const sender = await FamilyMember.findById(senderId).select(
          '_id name activeCircleId'
        );
        if (!sender) {
          return emitSocketError(socket, 'USER_NOT_FOUND', 'Sender not found');
        }

        if (
          !sender.activeCircleId ||
          sender.activeCircleId.toString() !== String(familyCircleId)
        ) {
          return emitSocketError(
            socket,
            'FORBIDDEN_ROOM',
            'You cannot send message to this vault'
          );
        }

        // store timestamp after checks pass
        socket.data.lastMessageAt = now;

        // Save message in DB
        const newMessage = await Message.create({
          familyCircleId,
          sender: sender._id,
          senderName: senderName || sender.name || socket.data.name || 'Unknown User',
          text: cleanText,
        });

        // Broadcast to same room only
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
     * payload: { familyCircleId, userId, name }
     */
    socket.on('typing_start', (payload) => {
      try {
        const { familyCircleId, userId, name } = payload || {};
        if (!familyCircleId || !userId) return;

        // Send to others only, not self
        socket.to(String(familyCircleId)).emit('member_typing', {
          userId,
          name: name || socket.data.name || 'Unknown User',
        });
      } catch (error) {
        // typing event fail ko silent rakhna okay hai
      }
    });

    /**
     * 4) typing_stop
     * payload: { familyCircleId, userId }
     */
    socket.on('typing_stop', (payload) => {
      try {
        const { familyCircleId, userId } = payload || {};
        if (!familyCircleId || !userId) return;

        socket.to(String(familyCircleId)).emit('member_stop_typing', {
          userId,
        });
      } catch (error) {
        // silent
      }
    });

    /**
     * 5) live_location_update (optional direct socket event)
     * Note: Main update should still come from REST controller for DB consistency
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