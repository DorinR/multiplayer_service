import "reflect-metadata"
import "dotenv-safe/config"
import cors from "cors"
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

io.on("connection", (socket) => {
    /** user connected */
    console.log("a user connected")

    /** user disconnected */
    socket.on("disconnect", () => {
        console.log("user disconnected")
    })

    /** message received */
    socket.on("chat message", (msg) => {
        console.log("message: " + msg)
        io.emit("chat message", msg)
    })
})

http.listen(port, () => {
    console.log(`Socket.IO server running at http://localhost:${port}/`)
})
