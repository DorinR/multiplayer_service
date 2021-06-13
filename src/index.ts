import "reflect-metadata"
import "dotenv-safe/config"
import cors from "cors"
import { Socket } from "socket.io"
const app = require("express")()
const http = require("http").Server(app)

const io = require("socket.io")(http, {
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

const allRoomsThatExistCurrently: Record<string, number> = {}
const listOutRooms = () => {
    console.log("******* ROOMS CENSUS *******")
    Object.entries(allRoomsThatExistCurrently).forEach(([room, population]) => {
        console.log(`Room number ${room} -> ${population} people`)
    })
    console.log("******* ------------ *******")
}
const roomJoined = (room) => {
    if (room in allRoomsThatExistCurrently) {
        allRoomsThatExistCurrently[room]++
    } else {
        allRoomsThatExistCurrently[room] = 1
    }
}

const runRoomStats = (room) => {
    roomJoined(room)
    listOutRooms()
}

io.on("connection", (socket: Socket) => {
    /** join specific room */
    socket.on("join", (room) => {
        socket.join(room)
        runRoomStats(room)
    })

    socket.on(socket.handshake.query.roomId, (msg) => {
        console.log(`message sent on channel ${socket.handshake.query.roomId}: ${msg}`)
        io.emit(socket.handshake.query.roomId, msg)
    })

    /** user disconnected */
    socket.on("disconnect", () => {
        console.log("user disconnected")
    })

    console.log(`There are now ${io.engine.clientsCount} client(s) connected.`)
})

http.listen(port, () => {
    console.log(`Socket.IO server running at http://localhost:${port}/`)
})
