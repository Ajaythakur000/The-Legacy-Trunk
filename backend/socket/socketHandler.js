import Message from '../models/messageModel.js';
import FamilyMember from '../models/familyMember.js';
import FamilyCircle from '../models/familyCircleModel.js';
import jwt from 'jsonwebtoken';

const emitSocketError = (socket, code, message) => {
  socket.emit('socket_error', { code, message });
};

// GLOBAL TRACKER FOR ONLINE USERS IN VAULTS
// circleId -> Map<userId, { userId, name, avatar, socketIds:Set<string> }>
const activeVaultUsers = new Map();

const broadcastOnlineUsers = (io, circleId) => {
  if (!circleId || !activeVaultUsers.has(circleId)) return;

  const usersMap = activeVaultUsers.get(circleId);
  const onlineList = Array.from(usersMap.values()).map((u) => ({
    userId: u.userId,
    name: u.name,
    avatar: u.avatar,
  }));

  io.to(circleId).emit('vault_online_users', {
    count: onlineList.length,
    users: onlineList,
  });
};

export const initializeSocket = (io) => {
  // 🔥 JWT AUTHENTICATION MIDDLEWARE
  io.use(async (socket, next) => {
    try {
      const tokenStr = socket.handshake.auth?.token;
      if (!tokenStr) return next(new Error('Authentication error: No token provided'));

      const token = tokenStr.startsWith('Bearer ') ? tokenStr.split(' ')[1] : tokenStr;
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // ✅ CRITICAL: token type validation
      if (decoded?.type !== 'auth') {
        return next(new Error('Authentication error: Invalid token type'));
      }

      if (!decoded?.id) {
        return next(new Error('Authentication error: Invalid token payload'));
      }

      const user = await FamilyMember.findById(decoded.id).select('_id name avatar activeCircleId role');
      if (!user) return next(new Error('Authentication error: User not found'));

      socket.user = user;
      next();
    } catch (err) {
      console.error('Socket Auth Error:', err.message);
      next(new Error('Authentication error: Invalid or expired token'));
    }
  });

  io.on('connection', (socket) => {
    console.log('🔌 Socket connected & Authenticated:', socket.id, '| User:', socket.user.name);
    socket.data.lastMessageAt = 0;

    socket.on('setup_user', () => {
      const roomName = String(socket.user._id);
      if (!socket.rooms.has(roomName)) {
        socket.join(roomName);
      }
    });

    // 🔥 SECURITY FIX: Story Feed Snooping Blocked
    socket.on('join_story_feed', async ({ circleId }) => {
      if (!circleId) return;
      try {
        const circle = await FamilyCircle.findOne({ _id: circleId, members: socket.user._id });
        if (circle) socket.join(String(circleId));
      } catch (err) {
        console.error(err);
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
        const { familyCircleId } = payload || {};
        if (!familyCircleId) return emitSocketError(socket, 'BAD_PAYLOAD', 'familyCircleId required');

        const circle = await FamilyCircle.findOne({ _id: familyCircleId, members: socket.user._id });
        if (!circle) return emitSocketError(socket, 'UNAUTHORIZED', 'You are not a member of this vault');

        const uIdStr = socket.user._id.toString();
        socket.data.userId = uIdStr;
        socket.data.name = socket.user.name || 'Unknown';
        socket.data.avatar = socket.user.avatar || '';
        socket.data.familyCircleId = String(familyCircleId);

        socket.join(String(familyCircleId));

        // ✅ multi-tab safe online presence tracking
        if (!activeVaultUsers.has(String(familyCircleId))) {
          activeVaultUsers.set(String(familyCircleId), new Map());
        }

        const circleUsersMap = activeVaultUsers.get(String(familyCircleId));
        const existing = circleUsersMap.get(uIdStr);

        if (existing) {
          existing.socketIds.add(socket.id);
          circleUsersMap.set(uIdStr, existing);
        } else {
          circleUsersMap.set(uIdStr, {
            userId: uIdStr,
            name: socket.data.name,
            avatar: socket.data.avatar,
            socketIds: new Set([socket.id]),
          });
        }

        broadcastOnlineUsers(io, String(familyCircleId));

        socket.emit('joined_vault', {
          message: 'Joined vault successfully',
          familyCircleId: String(familyCircleId),
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
        const { familyCircleId, text, clientMsgId, imageUrl, audioUrl } = payload || {};
        if (!familyCircleId) return emitSocketError(socket, 'BAD_PAYLOAD', 'familyCircleId missing');

        const circle = await FamilyCircle.findOne({ _id: familyCircleId, members: socket.user._id });
        if (!circle) return emitSocketError(socket, 'UNAUTHORIZED', 'Not authorized to send messages here');

        const cleanText = text ? String(text).trim() : '';
        if (!cleanText && !imageUrl && !audioUrl) {
          return emitSocketError(socket, 'EMPTY_MESSAGE', 'Message cannot be empty');
        }

        const now = Date.now();
        const diff = now - (socket.data.lastMessageAt || 0);
        if (diff < 1000) return emitSocketError(socket, 'RATE_LIMIT', 'Please wait 1 second');

        socket.data.lastMessageAt = now;

        const newMessage = await Message.create({
          familyCircleId,
          sender: socket.user._id,
          senderName: socket.user.name || 'Unknown',
          senderAvatar: socket.user.avatar || '',
          text: cleanText,
          imageUrl: imageUrl || '',
          audioUrl: audioUrl || '',
          seenBy: [socket.user._id],
        });

        io.to(String(familyCircleId)).emit('receive_message', {
          _id: newMessage._id,
          familyCircleId: String(newMessage.familyCircleId),
          senderId: newMessage.sender,
          senderName: newMessage.senderName,
          senderAvatar: newMessage.senderAvatar,
          text: newMessage.text,
          imageUrl: newMessage.imageUrl,
          audioUrl: newMessage.audioUrl,
          reactions: [],
          seenBy: newMessage.seenBy,
          createdAt: newMessage.createdAt,
          clientMsgId: clientMsgId || null,
        });
      } catch (error) {
        return emitSocketError(socket, 'SERVER_ERROR', error.message);
      }
    });

    /**
     * 3) SMART REACTIONS
     */
    socket.on('add_reaction', async (payload) => {
      try {
        const { messageId, emoji } = payload || {};
        if (!messageId || !emoji) return;

        const msg = await Message.findById(messageId);
        if (msg) {
          const circle = await FamilyCircle.findOne({ _id: msg.familyCircleId, members: socket.user._id });
          if (!circle) return;

          const uIdStr = String(socket.user._id);
          const existingReactionIndex = msg.reactions.findIndex((r) => String(r.userId) === uIdStr);

          if (existingReactionIndex > -1) {
            if (msg.reactions[existingReactionIndex].emoji === emoji) {
              // 🔥 FIX 1: Proper safe array filtering for mongoose
              msg.reactions = msg.reactions.filter((r) => String(r.userId) !== uIdStr);
            } else {
              msg.reactions[existingReactionIndex].emoji = emoji;
            }
          } else {
            msg.reactions.push({ emoji, userId: uIdStr, userName: socket.user.name });
          }

          msg.markModified('reactions');
          await msg.save();

          io.to(String(msg.familyCircleId)).emit('message_reaction_updated', {
            messageId,
            reactions: msg.reactions,
          });
        }
      } catch (error) {
        console.error(error);
      }
    });

    /**
     * 4) DELETE SINGLE MESSAGE
     */
    socket.on('delete_message', async (payload) => {
      try {
        const { messageId } = payload || {};
        if (!messageId) return;

        const msg = await Message.findById(messageId);
        if (!msg) return;

        const circle = await FamilyCircle.findById(msg.familyCircleId);

        // 🔥 FIX 2: Secure matching
        const isAuthor = String(msg.sender) === String(socket.user._id);
        const isAdmin = circle && circle.admin && String(circle.admin) === String(socket.user._id);

        if (!isAuthor && !isAdmin) {
          return emitSocketError(socket, 'UNAUTHORIZED', 'You do not have permission to delete this message');
        }

        await Message.findByIdAndDelete(messageId);
        io.to(String(msg.familyCircleId)).emit('message_deleted', { messageId });
      } catch (error) {
        console.error(error);
      }
    });

    /**
     * 5) CLEAR ALL CHAT (Admin Only)
     */
    socket.on('clear_vault_chat', async (payload) => {
      try {
        const { familyCircleId } = payload || {};
        if (!familyCircleId) return;

        const circle = await FamilyCircle.findById(familyCircleId);
        if (!circle || String(circle.admin) !== String(socket.user._id)) {
          return emitSocketError(socket, 'UNAUTHORIZED', 'Only the Family Admin can clear the vault chat!');
        }

        await Message.deleteMany({ familyCircleId });
        io.to(String(familyCircleId)).emit('vault_chat_cleared');
      } catch (error) {
        console.error(error);
      }
    });

    // 🔥 SECURITY FIX: Typing Spam Blocked
    socket.on('typing_start', (payload) => {
      try {
        const { familyCircleId } = payload || {};
        if (!familyCircleId || String(familyCircleId) !== socket.data.familyCircleId) return;

        socket.to(String(familyCircleId)).emit('member_typing', {
          senderId: String(socket.user._id),
          senderName: socket.user.name || 'Unknown User',
        });
      } catch (error) {}
    });

    socket.on('typing_stop', (payload) => {
      try {
        const { familyCircleId } = payload || {};
        if (!familyCircleId || String(familyCircleId) !== socket.data.familyCircleId) return;

        socket.to(String(familyCircleId)).emit('member_stop_typing', {
          senderId: String(socket.user._id),
          senderName: socket.user.name || 'Unknown User',
        });
      } catch (error) {}
    });

    socket.on('leave_vault', (payload) => {
      try {
        const { familyCircleId } = payload || {};
        if (!familyCircleId) return;

        socket.leave(String(familyCircleId));

        const circleId = String(familyCircleId);
        const userId = socket.data.userId;

        if (userId && activeVaultUsers.has(circleId)) {
          const usersMap = activeVaultUsers.get(circleId);
          const entry = usersMap.get(userId);

          if (entry) {
            entry.socketIds.delete(socket.id);
            if (entry.socketIds.size === 0) usersMap.delete(userId);
            else usersMap.set(userId, entry);
          }

          if (usersMap.size === 0) activeVaultUsers.delete(circleId);
          broadcastOnlineUsers(io, circleId);
        }
      } catch (error) {}
    });

    socket.on('disconnect', () => {
      console.log('❌ Socket disconnected:', socket.id);

      const circleId = socket.data.familyCircleId;
      const userId = socket.data.userId;
      if (!circleId || !userId || !activeVaultUsers.has(circleId)) return;

      const usersMap = activeVaultUsers.get(circleId);
      const entry = usersMap.get(userId);

      if (entry) {
        entry.socketIds.delete(socket.id);
        if (entry.socketIds.size === 0) usersMap.delete(userId);
        else usersMap.set(userId, entry);
      }

      if (usersMap.size === 0) activeVaultUsers.delete(circleId);
      broadcastOnlineUsers(io, circleId);
    });
  });
};