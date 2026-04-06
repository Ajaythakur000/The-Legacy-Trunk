import Message from '../models/messageModel.js';
import FamilyMember from '../models/familyMember.js';

const emitSocketError = (socket, code, message) => {
  socket.emit('socket_error', { code, message });
};

// 🔥 GLOBAL TRACKER FOR ONLINE USERS IN VAULTS
const activeVaultUsers = new Map(); // familyCircleId -> Map(userId -> { name, avatar })

const broadcastOnlineUsers = (io, circleId) => {
  if (!circleId || !activeVaultUsers.has(circleId)) return;
  const usersMap = activeVaultUsers.get(circleId);
  const onlineList = Array.from(usersMap.values());
  io.to(circleId).emit('vault_online_users', {
    count: onlineList.length,
    users: onlineList
  });
};

export const initializeSocket = (io) => {
  io.on('connection', (socket) => {
    console.log('🔌 Socket connected:', socket.id);
    socket.data.lastMessageAt = 0;

    socket.on('setup_user', (userId) => {
      if (!userId) return;
      const roomName = String(userId);
      if (!socket.rooms.has(roomName)) {
        socket.join(roomName); 
      }
    });

    socket.on('join_story_feed', ({ circleId }) => {
      if (!circleId) return;
      const roomName = String(circleId);
      if (!socket.rooms.has(roomName)) {
        socket.join(roomName); 
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
        const { familyCircleId, userId, name, avatar } = payload || {};
        if (!familyCircleId || !userId) return emitSocketError(socket, 'BAD_PAYLOAD', 'familyCircleId and userId required');

        const user = await FamilyMember.findById(userId).select('_id name avatar');
        if (!user) return emitSocketError(socket, 'USER_NOT_FOUND', 'User not found');

        const uIdStr = user._id.toString();
        socket.data.userId = uIdStr;
        socket.data.name = name || user.name || 'Unknown';
        socket.data.avatar = avatar || user.avatar || '';
        socket.data.familyCircleId = String(familyCircleId);

        socket.join(String(familyCircleId));

        if (!activeVaultUsers.has(String(familyCircleId))) {
          activeVaultUsers.set(String(familyCircleId), new Map());
        }
        activeVaultUsers.get(String(familyCircleId)).set(uIdStr, {
          userId: uIdStr,
          name: socket.data.name,
          avatar: socket.data.avatar
        });

        broadcastOnlineUsers(io, String(familyCircleId));

        socket.emit('joined_vault', { message: 'Joined vault successfully', familyCircleId: String(familyCircleId) });
      } catch (error) {
        return emitSocketError(socket, 'SERVER_ERROR', error.message);
      }
    });

    /**
     * 2) send_message
     */
    socket.on('send_message', async (payload) => {
      try {
        const { familyCircleId, senderId, senderName, text, clientMsgId, imageUrl, audioUrl, avatar } = payload || {};
        if (!familyCircleId || !senderId) return emitSocketError(socket, 'BAD_PAYLOAD', 'Required fields missing');

        const cleanText = text ? String(text).trim() : '';
        if (!cleanText && !imageUrl && !audioUrl) return emitSocketError(socket, 'EMPTY_MESSAGE', 'Message cannot be totally empty');

        const now = Date.now();
        const diff = now - (socket.data.lastMessageAt || 0);
        if (diff < 1000) return emitSocketError(socket, 'RATE_LIMIT', 'Please wait 1 second');

        const sender = await FamilyMember.findById(senderId).select('_id name avatar');
        if (!sender) return emitSocketError(socket, 'USER_NOT_FOUND', 'Sender not found');

        socket.data.lastMessageAt = now;

        const newMessage = await Message.create({
          familyCircleId,
          sender: sender._id,
          senderName: senderName || sender.name || socket.data.name || 'Unknown',
          senderAvatar: avatar || sender.avatar || '', 
          text: cleanText,
          imageUrl: imageUrl || '',
          audioUrl: audioUrl || '',
          seenBy: [sender._id] 
        });

        io.to(String(familyCircleId)).emit('receive_message', {
          _id: newMessage._id,
          familyCircleId: newMessage.familyCircleId,
          senderId: newMessage.sender, 
          senderName: newMessage.senderName,
          senderAvatar: newMessage.senderAvatar,
          text: newMessage.text,
          imageUrl: newMessage.imageUrl,
          audioUrl: newMessage.audioUrl,
          reactions: [],
          seenBy: newMessage.seenBy,
          createdAt: newMessage.createdAt,
          clientMsgId: clientMsgId || null 
        });
      } catch (error) {
        return emitSocketError(socket, 'SERVER_ERROR', error.message);
      }
    });

    /**
     * 3) 🔥 SMART REACTIONS (Toggle & Swap)
     */
    socket.on('add_reaction', async (payload) => {
      try {
        const { familyCircleId, messageId, emoji, userId, userName } = payload || {};
        if (!messageId || !emoji || !userId) return;

        const msg = await Message.findById(messageId);
        if (msg) {
          const existingReactionIndex = msg.reactions.findIndex(r => String(r.userId) === String(userId));

          if (existingReactionIndex > -1) {
            if (msg.reactions[existingReactionIndex].emoji === emoji) {
              // Clicked same emoji -> Remove it
              msg.reactions.splice(existingReactionIndex, 1);
            } else {
              // Clicked different emoji -> Swap it
              msg.reactions[existingReactionIndex].emoji = emoji;
            }
          } else {
            // New reaction
            msg.reactions.push({ emoji, userId, userName });
          }

          await msg.save();
          io.to(String(familyCircleId)).emit('message_reaction_updated', { messageId, reactions: msg.reactions });
        }
      } catch (error) { console.error(error); }
    });

    /**
     * 4) 🔥 DELETE SINGLE MESSAGE
     */
    socket.on('delete_message', async (payload) => {
      try {
        const { familyCircleId, messageId } = payload || {};
        if (!familyCircleId || !messageId) return;

        await Message.findByIdAndDelete(messageId);
        io.to(String(familyCircleId)).emit('message_deleted', { messageId });
      } catch (error) { console.error(error); }
    });

    /**
     * 5) 🔥 CLEAR ALL CHAT (Admin Only)
     */
    socket.on('clear_vault_chat', async (payload) => {
      try {
        const { familyCircleId } = payload || {};
        if (!familyCircleId) return;

        await Message.deleteMany({ familyCircleId });
        io.to(String(familyCircleId)).emit('vault_chat_cleared');
      } catch (error) { console.error(error); }
    });

    socket.on('typing_start', (payload) => {
      try {
        const { familyCircleId, senderId, senderName, name } = payload || {};
        if (!familyCircleId || !senderId) return;
        socket.to(String(familyCircleId)).emit('member_typing', {
          senderId: String(senderId),
          senderName: senderName || name || socket.data.name || 'Unknown User'
        });
      } catch (error) {}
    });

    socket.on('typing_stop', (payload) => {
      try {
        const { familyCircleId, senderId, senderName, name } = payload || {};
        if (!familyCircleId || !senderId) return;
        socket.to(String(familyCircleId)).emit('member_stop_typing', {
          senderId: String(senderId),
          senderName: senderName || name || socket.data.name || 'Unknown User'
        });
      } catch (error) {}
    });

    socket.on('leave_vault', (payload) => {
      try {
        const { familyCircleId } = payload || {};
        if (!familyCircleId) return;
        
        socket.leave(String(familyCircleId));
        
        if (socket.data.userId && activeVaultUsers.has(String(familyCircleId))) {
          activeVaultUsers.get(String(familyCircleId)).delete(socket.data.userId);
          broadcastOnlineUsers(io, String(familyCircleId));
        }
      } catch (error) {}
    });

    socket.on('disconnect', () => {
      console.log('❌ Socket disconnected:', socket.id);
      if (socket.data.familyCircleId && socket.data.userId) {
        const circleId = socket.data.familyCircleId;
        if (activeVaultUsers.has(circleId)) {
          activeVaultUsers.get(circleId).delete(socket.data.userId);
          broadcastOnlineUsers(io, circleId);
        }
      }
    });
  });
};