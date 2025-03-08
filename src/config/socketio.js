import { Server } from "socket.io";

let io;
const onlineUsers = new Map(); // userId -> socketId mapping

// ✅ Initialize Socket.io
export const initSocket = (server) => {
    io = new Server(server, { cors: { origin: "*" } });

    io.on("connection", (socket) => {
        console.log("🔌 User connected:", socket.id);

        // Register user with their socket
        socket.on("register", (userId) => {
            onlineUsers.set(userId, socket.id);
            console.log(`✅ User ${userId} registered with socket ${socket.id}`);
        });

        // Handle disconnection
        socket.on("disconnect", () => {
            const disconnectedUser = [...onlineUsers.entries()].find(([_, id]) => id === socket.id);
            if (disconnectedUser) {
                onlineUsers.delete(disconnectedUser[0]);
                console.log(`❌ User ${disconnectedUser[0]} disconnected`);
            }
        });
    });

    return io;
};

// ✅ Function to Send Notification
export const sendRealTimeNotification = (userId, message) => {
    const socketId = onlineUsers.get(userId);
    if (socketId) {
        io.to(socketId).emit("newNotification", { message });
        console.log(`📢 Sent real-time notification to User ${userId}`);
    } else {
        console.log(`⚠️ User ${userId} is offline, notification saved only in DB.`);
    }
};

// ✅ Function to Get Socket.io Instance
export const getIo = () => {
    if (!io) {
        throw new Error("Socket.io has not been initialized!");
    }
    return io;
};

export { onlineUsers };
