import express from "express"
import {createServer} from "node:http"
import mongoose from "mongoose"
import cors from "cors"
import { initializeSocket } from "./src/controllers/socketManager.js"
import userRoutes from "./src/routes/users.route.js"


const app = express()
const server = createServer(app);
const io = initializeSocket(server)

// set & get method  ----
// app.set("port", (process.env.PORT || 8000));


app.use(cors())
app.use(express.json({limit: "40kb"}))
app.use(express.urlencoded({limit: "40kb", extended: true}))

app.use("/api/v1/users", userRoutes);


const start = async () => {

    // Start the Server ----
    server.listen(8000, () => {
        console.log("LISTENING ON PORT 8000...")
    })

    const connectionDb = await mongoose.connect(
        "mongodb+srv://pyush671:KlemwCBI8qRyJhID@cluster1.vmu33.mongodb.net/"
    )
    console.log()
    // app.listen(8000, () => {
    //     console.log("LISTENING ON PORT 8000")
    // })
}

start();