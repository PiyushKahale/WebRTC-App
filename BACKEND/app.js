import express from "express"
import {createServer} from "http"
import mongoose from "mongoose"
import cors from "cors"
import { connectToSocket } from "./src/controllers/socketManager.js"
import userRoutes from "./src/routes/users.route.js"


const app = express();
const server = createServer(app);
const io = connectToSocket(server)

// set & get method  ----
const PORT = process.env.PORT || 8000;
const mongoURL = "mongodb+srv://pyush671:KlemwCBI8qRyJhID@cluster1.vmu33.mongodb.net/";

app.use(cors());
app.use(express.json({limit: "40kb"}));
app.use(express.urlencoded({limit: "40kb", extended: true}));

app.use("/api/v1/users", userRoutes);

app.get("/", (req, res) => {
    res.send("BACKEND is Ready....!");
})


const start = async () => {
    try {
        const connectionDb = await mongoose.connect(mongoURL)
        console.log("✅ MongoDB Connected");
    } catch(err) {
        console.log(err);
    }

    // Start the Server ----
    server.listen(PORT, () => {
        console.log(`Server is Listening on ${PORT}...`)
    });
}

start();