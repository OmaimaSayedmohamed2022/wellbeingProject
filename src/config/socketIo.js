import { Server } from "socket.io";

let io;

export const initSocket = (server) => {
  io = new Server(server, { cors: { origin: "*" } });

  io.on("connection", (socket) => {
    console.log("🔌 مستخدم متصل");

    socket.on("disconnect", () => {
      console.log("❌ مستخدم قطع الاتصال");
    });
  });

  return io;
};

export { io };
