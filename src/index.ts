import "reflect-metadata"
import "dotenv-safe/config"
import cors from "cors"
import express from "express"
import http from "http"
import { Socket } from "socket.io"
import { Users } from "./models/Users"
import { User } from "./models/User"
import { Rooms } from "./models/Rooms"
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

app.get("/getUniqueRoomId", (_, res) => {
    const roomId = getUnusedRoomNumber()
    res.json({
        roomNumber: roomId,
    })
})

const getUnusedRoomNumber = () => {
    let i = 1
    while (true) {
        if (!(i in rooms.rooms)) {
            return i
        }
        i += 1
    }
}

app.use(
    cors({
        origin: process.env.CORS_ORIGIN,
        credentials: true,
    })
)

/**Used to track the users that are currently connected to the backend */
var users = new Users()

/**User to track the existing rooms */
var rooms = new Rooms()

io.on("connection", (socket: Socket) => {
    console.log(`User connected, there are now ${io.engine.clientsCount} client(s) connected.`)
    const user = new User(socket.id)
    users.add(user)
    // temporary logging
    rooms.printAll()
    users.printAll()

    /**Person joins room */
    socket.on("join room", ({ roomName, username }: { roomName: number; username: string }) => {
        // if user was already part of a room, remove him from it first
        if (user.roomNumber) {
            socket.leave(String(user.roomNumber))
            rooms.removeUserFromRoom(user.roomNumber, socket.id)
        }

        // if room is not full, add user to room
        const { error } = rooms.addUserToRoom(roomName, socket.id)
        if (error) {
            console.log(`${username} could not join room ${roomName}, it's already full`)
        } else {
            socket.join(String(roomName))
            user.roomNumber = roomName
            user.username = username
            socket.to(String(roomName)).emit("successfully joined", `${username} joined ${roomName}`)
            console.log(`${username} joined room ${roomName}`)
        }

        // temporary logging
        rooms.printAll()
        users.printAll()
    })

    /**Person sends message */
    socket.on("send message", ({ roomName, message, from }: { roomName: string; message: string; from: string }) => {
        console.log(`message from ${from}: ${message} to room ${roomName}`)
        socket.to(roomName).emit("new message", message)
    })

    /** user disconnected */
    socket.on("disconnect", () => {
        if (user.roomNumber) {
            socket.leave(String(user.roomNumber))
            rooms.removeUserFromRoom(user.roomNumber, socket.id)
        }
        users.remove(socket.id)
        console.log(`User disconnected, there are now ${io.engine.clientsCount} client(s) connected.`)
        // temporary logging
        rooms.printAll()
        users.printAll()
    })
})

server.listen(port, () => {
    console.log(`Socket.IO server running at http://localhost:${port}/`)
})
