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

app.use(cors())

app.get("/", (_, res) => {
    res.send("server is good")
})

app.get("/getUniqueRoomId", (_, res) => {
    const roomId = getUnusedRoomNumber()
    res.json({
        roomNumber: roomId,
    })
})

app.get("/rooms/isRoomJoinable/:roomNumber", (req, res) => {
    const { roomNumber } = req.params

    res.json({
        data: rooms.isRoomJoinable(parseInt(roomNumber, 10)),
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
    socket.on("join room", ({ roomNumber, username }: { roomNumber: number; username: string }) => {
        // if user was already part of a room, remove him from it first
        if (user.roomNumber) {
            socket.leave(String(user.roomNumber))
            rooms.removeUserFromRoom(user.roomNumber, socket.id)
        }

        // if room is not full, add user to room
        const { error } = rooms.addUserToRoom(roomNumber, socket.id)
        if (error) {
            console.log(`${username} could not join room ${roomNumber}, it's already full`)
        } else {
            socket.join(String(roomNumber))
            user.roomNumber = roomNumber
            user.username = username
            io.in(String(roomNumber)).emit("successfully joined", {
                updatedRoom: rooms.getRoomByRoomNumber(roomNumber),
                username,
            })
            console.log(`${username} joined room ${roomNumber}`)
        }

        // temporary logging
        rooms.printAll()
        users.printAll()
    })

    /**Leaving a room */
    socket.on("leave room", () => {
        if (user.roomNumber) {
            console.log(`${user.username} left room ${user.roomNumber}`)
            socket.to(String(user.roomNumber)).emit("left room")
            socket.leave(String(user.roomNumber))
            rooms.removeUserFromRoom(user.roomNumber, socket.id)
            delete user.roomNumber
            delete user.username
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

    /**Update game phase */
    socket.on("update game phase", ({ newGamePhase, roomNumber }: { newGamePhase: string; roomNumber: string }) => {
        console.log(`game phase updated to ${newGamePhase}`)
        socket.to(roomNumber).emit("update game phase", newGamePhase)
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
