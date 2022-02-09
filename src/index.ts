import "reflect-metadata"
import "dotenv-safe/config"
import cors from "cors"
import express from "express"
import http from "http"
import Chance from "chance"
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
const chance = new Chance()

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
        data: rooms.isRoomJoinable(roomNumber),
    })
})

const generateTentativeRoomName = () => {
    return `${chance.first().toLowerCase()}-${chance.integer({ min: 1, max: 1000 })}`
}

const getUnusedRoomNumber = () => {
    while (true) {
        let tentativeRoomName = generateTentativeRoomName()
        if (!(tentativeRoomName in rooms.rooms)) {
            return tentativeRoomName
        }
    }
}

/**Used to track the users that are currently connected to the backend */
var users = new Users()

/**Used to track the existing rooms for private matches*/
var rooms = new Rooms()

/**Used to track public game rooms*/
var publicRooms = new Rooms()

io.on("connection", (socket: Socket) => {
    console.log(`User connected, there are now ${io.engine.clientsCount} client(s) connected.`)
    const user = new User(socket.id)
    users.add(user)
    // temporary logging
    rooms.printAll()
    users.printAll()

    /**Person joins room */
    socket.on("join room", ({ roomNumber, username }: { roomNumber: string; username: string }) => {
        // if user was already part of a room, remove him from it first
        if (user.roomName) {
            socket.leave(String(user.roomName))
            rooms.removeUserFromRoom(user.roomName, socket.id)
        }

        // if room is not full, add user to room
        const { error } = rooms.addUserToRoom(roomNumber, socket.id)
        if (error) {
            console.log(`${username} could not join room ${roomNumber}, it's already full`)
        } else {
            socket.join(String(roomNumber))
            user.roomName = roomNumber
            user.username = username
            io.in(String(roomNumber)).emit("successfully joined", {
                updatedRoom: rooms.getRoomByRoomName(roomNumber),
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
        if (user.roomName) {
            console.log(`${user.username} left room ${user.roomName}`)
            socket.to(String(user.roomName)).emit("left room")
            socket.leave(String(user.roomName))
            rooms.removeUserFromRoom(user.roomName, socket.id)
            delete user.roomName
            delete user.username
        }
        // temporary logging
        rooms.printAll()
        users.printAll()
    })

    /**Person sends message */
    socket.on(
        "updated board",
        ({
            roomName,
            updatedPuzzleState,
            username,
        }: {
            roomName: string
            updatedPuzzleState: string
            username: string
        }) => {
            socket.to(roomName).emit("opponents new board", updatedPuzzleState)
            if (updatedPuzzleState.indexOf("1") === -1) {
                io.in(roomName).emit("winner detected", username)
            }
        }
    )

    /**Update game phase */
    socket.on("update game phase", ({ newGamePhase, roomNumber }: { newGamePhase: string; roomNumber: string }) => {
        console.log(`game phase updated to ${newGamePhase}`)
        socket.to(roomNumber).emit("update game phase", newGamePhase)
    })

    /**Broadcasting starting game state */
    socket.on("starting game board", ({ roomNumber, startingState }: { roomNumber: string; startingState: string }) => {
        console.log(`Game starting in room ${roomNumber} with puzzle ${startingState}`)
        io.in(String(roomNumber)).emit("starting game board", startingState)
    })

    /** user disconnected */
    socket.on("disconnect", () => {
        if (user.roomName) {
            socket.leave(String(user.roomName))
            rooms.removeUserFromRoom(user.roomName, socket.id)
        }
        users.remove(socket.id)
        console.log(`User disconnected, there are now ${io.engine.clientsCount} client(s) connected.`)
        // temporary logging
        rooms.printAll()
        users.printAll()
    })

    /** joining matchmaking queue */
    socket.on("join matchmaking queue", ({ username }: { username: string }) => {
        console.log(`${username} has joined the matchmaking queue`)
    })
})

server.listen(port, () => {
    console.log(`Socket.IO server running at http://localhost:${port}/`)
})
