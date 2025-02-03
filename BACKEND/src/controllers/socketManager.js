import { Server } from "socket.io";

let connections = {}
let messages = {}
let timeOnline = {}

export const connectToSocket = (server) => {
    const io = new Server(server, {
        cors: {
            origin: "http://localhost:5173",
            methods: ["GET", "POST"],
            allowedHeaders: ["*"],
            credentials: true
        }
    });

    
    // ---- works like addEventListener
    io.on("connection", (socket) => {

        console.log("SomeThing is Connected....");

        // ---- on frontend side name should be same
        socket.on("join-call", (path) => {
            if(!connections[path]) {
                connections[path] = []
            }

            connections[path].push(socket.id)

            timeOnline[socket.id] = Date.now()

            for(let i = 0; i < connections[path].length; i++) {
                io.to(connections[path][i]).emit("user-joined", socket.id, connections[path])
            }

            if(messages[path]) {
                // data , sender , socket-id-sender
                for(let a = 0; a < messages[path].length; ++a) {
                    io.to(socket.id).emit("chat-message", messages[path][a]['data'],
                    messages[path][a]['sender'], messages[path][a]['socket-id-sender'])
                }
            }
        });

        socket.on("signal", (toId, message) => {
            io.to(toId).emit("signal", socket.id, message);
        });

        socket.on("chat-message", (data, sender) => {
            const [matchingRoom, found] = Object.entries(connections).reduce(
            // reduce - (accumulator, entries) 
                ([room, isFound], [roomKey, roomValue]) => {
                
                    if(!isFound && roomValue.includes(socket.id)) {
                        return [roomKey, true];
                    }
                return [room, isFound];
            
            }, ["", false]);   

            if(found) {
                if(messages[matchingRoom]) {
                    messages[matchingRoom] = []
                }

                messages[matchingRoom].push({'sender': sender, "data": data, "socket-id-sender": socket.id });
                console.log("message", key, ":", sender, data)

                connections[matchingRoom].forEach((ele) => {
                    io.to(ele).emit("chat-message", data, sender, socket.id)
                });
            }
        });

        socket.on("disconnect", () => {
            
            var diffTime = Math.abs(timeOnline[socket.id] - new Date.now())

            var key

            for(const [k, v] of JSON.parse(JSON.stringify(Object.entries(connections)))) {

                for(let a = 0; a < v.length; ++a) {
                    if(v[a] === socket.id) {
                        key = k

                        for(let a = 0; a < connections[key].length; ++a) {
                            io.to(connections[key][a]).emit('user-left', socket.id)
                        }

                        var index = connections[key].indexOf(socket.id)

                        connections[key].splice(index, 1)

                        if(connections[key].length === 0) {
                            delete connections[key] 
                        }
                    }
                }
            }
        });

    });

    return io;
};