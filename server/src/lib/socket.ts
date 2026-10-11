import { Server } from "socket.io"
import { Server as HttpServer } from "http"

let io: Server

export const iniSocket = (httpServer: HttpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: [
        "http://localhost:5173",
        "http://192.168.18.65:5173",
        "http://localhost:5174",
      ],
    },
  })

  return io
}

export const getIO = () => {
  if (!io) {
    throw new Error("Socket.IO has not been initialized")
  }

  return io
}
