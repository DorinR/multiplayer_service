import "reflect-metadata"
import "dotenv-safe/config"
import cors from "cors"
import express from "express"
import http from "http"
import { Socket } from "socket.io"
const app = express()
const server = http.createServer(app)
const io = require("socket.io")(server, {
    cors: {
        origin: process.env.CORS_ORIGIN,
        methods: ["GET", "POST"],
    },
})

const port = process.env.PORT || 4000

app.get("/", (_, res) => {
    res.send("server is good")
})

app.use(
    cors({
        origin: process.env.CORS_ORIGIN,
        credentials: true,
    })
)

// let users = new Users()
// let rooms = new Rooms()

const socketRooms: Record<string, string> = {}

io.on("connection", (socket: Socket) => {
    console.log(`User joined, there are now ${io.engine.clientsCount} client(s) connected.`)
    /**Person joins room */
    socket.on("join room", ({ roomName, username }: { roomName: string; username: string }) => {
        console.log(`${username} joined room ${roomName}`)
        if (socket.id in socketRooms) {
            socket.leave(socketRooms[socket.id])
        }
        socket.join(roomName)
        socketRooms[socket.id] = roomName

        socket.to(roomName).emit("successfully joined", `${username} joined ${roomName}`)
    })

    /**Person sends message */
    socket.on("send message", ({ roomName, message, from }: { roomName: string; message: string; from: string }) => {
        console.log(`message from ${from}: ${message} to room ${roomName}`)
        socket.to(roomName).emit("new message", message)
    })

    /** user disconnected */
    socket.on("disconnect", () => {
        delete socketRooms[socket.id]
        console.log(`User left, there are now ${io.engine.clientsCount} client(s) connected.`)
    })
})

server.listen(port, () => {
    console.log(`Socket.IO server running at http://localhost:${port}/`)
})
