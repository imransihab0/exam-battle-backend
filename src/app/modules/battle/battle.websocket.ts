import { Server } from "socket.io";
import { envVars } from "../../config/env";

export const initWebSocket = (httpServer: any) => {
  const io = new Server(httpServer, {
    cors: {
      origin: envVars.CORS_FRONTEND_URL,
      credentials: true,
    },
  });

  const roomReadyStatus: Record<string, Set<string>> = {};
  const onlineUsers = new Map<string, Set<string>>(); // userId -> Set<socketId>
  const socketUserMap = new Map<string, string>(); // socketId -> userId
  const lobbyDataMap = new Map<string, any>(); // battleRoomId -> lobbyData

  io.on("connection", (socket) => {
    socket.on("join_self", (userId: string) => {
      socket.join(userId);

      // Online Status Logic
      socketUserMap.set(socket.id, userId);
      if (!onlineUsers.has(userId)) {
        onlineUsers.set(userId, new Set());
        // Notify everyone this user is online
        io.emit("user_online", { userId });
      }
      onlineUsers.get(userId)?.add(socket.id);
    });

    socket.on("get_online_users", () => {
      socket.emit("online_users_list", Array.from(onlineUsers.keys()));
    });

    socket.on("invitation", (data) => {
      io.to(data.receiverFriendId).emit("acceptInvitation", data);
    });

    socket.on("accepted", (data) => {
      const { senderUserInfo, acceptedUserInfo } = data;

      if (!senderUserInfo?._id || !acceptedUserInfo?._id) {
        return;
      }

      const battleRoomId = `battle_${senderUserInfo._id}_${acceptedUserInfo._id}`;

      io.in(acceptedUserInfo._id).socketsJoin(battleRoomId);
      io.in(senderUserInfo._id).socketsJoin(battleRoomId);

      const payload = { ...data, battleRoomId };

      // Store lobby data
      lobbyDataMap.set(battleRoomId, payload);
      console.log("Lobby created:", battleRoomId, payload);

      io.to(acceptedUserInfo._id).emit("join_lobby", payload);
      io.to(senderUserInfo._id).emit("join_lobby", payload);
    });

    socket.on(
      "leave_lobby",
      (data: { opponentId: string; battleRoomId: string }) => {
        if (data.opponentId) {
          io.to(data.opponentId).emit("lobby_disbanded");
        }

        if (data.battleRoomId) {
          io.in(data.battleRoomId).socketsLeave(data.battleRoomId);
          lobbyDataMap.delete(data.battleRoomId);
        }
      },
    );

    socket.on("update_arena", (data) => {
      // Update lobby data
      if (data.battleRoomId) {
        lobbyDataMap.set(data.battleRoomId, data);
        console.log("Arena updated:", data.battleRoomId, data);
      }
      io.to(data.battleRoomId).emit("arena_updated", data);
    });

    // Ready Status Logic

    socket.on("player_ready", (data: { battleRoomId: string; userId: string }) => {
      const { battleRoomId, userId } = data;

      if (!roomReadyStatus[battleRoomId]) {
        roomReadyStatus[battleRoomId] = new Set();
      }

      roomReadyStatus[battleRoomId].add(userId);

      // Notify others in room
      socket.to(battleRoomId).emit("opponent_ready", { userId });

      // Check if 2 players are ready
      if (roomReadyStatus[battleRoomId].size >= 2) {
        const lobbyData = lobbyDataMap.get(battleRoomId);
        const startPayload = { battleRoomId, ...lobbyData };

        console.log("Battle starting:", startPayload);
        io.to(battleRoomId).emit("battle_start", startPayload);

        // Cleanup
        delete roomReadyStatus[battleRoomId];
        // lobbyDataMap.delete(battleRoomId); // REMOVED to persist data for battle page
      }
    });

    socket.on("join_battle", (data: { battleRoomId: string }) => {
      const battleData = lobbyDataMap.get(data.battleRoomId);
      console.log("SERVER: join_battle request for:", data.battleRoomId);
      if (battleData) {
        console.log("SERVER: Found data, sending battle_details");
        socket.join(data.battleRoomId);
        socket.emit("battle_details", battleData);
      } else {
        console.log("SERVER: Data NOT found for:", data.battleRoomId);
      }
    });

    socket.on("player_unready", (data: { battleRoomId: string; userId: string }) => {
      const { battleRoomId, userId } = data;

      if (roomReadyStatus[battleRoomId]) {
        roomReadyStatus[battleRoomId].delete(userId);

        // Notify others
        socket.to(battleRoomId).emit("opponent_unready", { userId });
      }
    });

    socket.on("disconnect", () => {
      console.log("Client disconnected");

      const userId = socketUserMap.get(socket.id);
      if (userId) {
        socketUserMap.delete(socket.id);
        const userSockets = onlineUsers.get(userId);
        if (userSockets) {
          userSockets.delete(socket.id);
          if (userSockets.size === 0) {
            onlineUsers.delete(userId);
            io.emit("user_offline", { userId });
          }
        }
      }
    });
  });

  return io;
};
