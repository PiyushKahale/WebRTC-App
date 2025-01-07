import { application } from "express"
import { Server } from "socket.io"

let connections = {}
let messages = {}
let timeOnline = {}

export const  initializeSocket = (server) => {
    const io = new Server(server, {
        cors: {
            origin: "*",
            methods: ["GET", "POST"],
            allowedHeaders: ["*"],
            credentials: true,
        }
    });

    // ---- works like addEventListener
    io.on("connection", (socket) => {

        // ---- on frontend side name should be same
        socket.on("join-call", (path) => {
            if(connections[path] === undefined) {
                connections[path] = []
            }

            connections[path].push(socket.id)

            timeOnline[socket.id] = new Date()

            // connections[path].forEach(elem => {
            //     io.to(elem).emit("user-joined", socket.id)
            // });

            for(let a = 0; a < connections[path].length; a++) {
                io.to(connections[path][a]).emit("user-joined", socket.id, connections[path])
            }

            if(messages[path] !== undefined) {
                // data , sender , socket-id-sender
                for(let a = 0; a < connections[path].length; ++a) {
                    io.to(socket.id).emit("chat-message", messages[path][a]['data'],
                    messages[path][a]['sender'], messages[path][a]['socket-id-sender'])
                }
            }


        })

        socket.on("signal", (toId, message) => {
            io.to(toId).emit("signal", socket.id, message);
        })

        socket.on("chat-message", (data, sender) => {
            const [matchingRoom, found] = Object.entries(connections)
            // reduce - (accumulator, entries) 
            .reduce(([room, isFound], [roomKey, roomValue]) => {
                
                if(!isFound && roomValue.includes(socket.id)) {
                    return [roomKey, true];
                }
                
                return [room, isFound];
            
            }, ['', false]);   

            if(found === true) {
                if(messages[matchingRoom] === undefined) {
                    messages[matchingRoom] = []
                }

                messages[matchingRoom].push({'sender': sender, 'data': data, "socket-id-sender": socket.id })
                console.log("message", key, ":", sender, data)

                connections[matchingRoom].forEach((ele) => {
                    io.to(ele).emit("chat-message", data, sender, socket.id)
                })
            }
        })

        socket.on("disconnect", () => {
            
            var diffTime = Math.abs(timeOnline[socket.id] - new Date())

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
        })

    })

    return io;
}