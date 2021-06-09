import "reflect-metadata"
import "dotenv-safe/config"
import express from "express"

const main = async () => {
    const app = express()

    app.listen(parseInt(process.env.PORT), () => {
        console.log(`server started on localhost:${process.env.PORT}`)
    })

    app.get("/", (req, res) => {
        res.send("server is good")
    })
}

main().catch((err) => console.error(err))
