import React, { useEffect, useRef, useState } from 'react'
import io from "socket.io-client"
import "../styles/Video.css"
import TextField from '@mui/material/TextField';
import { Button } from '@mui/material';

const server_url = "http://localhost:8000";

var connections = {}

// Config Stun servers
// STUN server helps a peer discover its public IP address and port
// which is essential for NAT traversal (allowing devices behind routers/firewalls to communicate directly)
const peerConfigConn = {
    // ICE servers help discover candidates (network paths) for peer-to-peer connectivity.
    "iceServers": [
        { "urls": "stun:stun4.l.google.com:19302" }
    ]
}

export default function Video() {

    var socketRef = React.useRef()
    let socketIdRef = React.useRef()
    let localVideoRef = React.useRef()
    
    let [ videoAvail, setVideoAvail ] = useState(true)
    let [ audioAvail, setAudioAvail ] = useState(true)
    
    let [ video, setVideo ] = useState([])
    let [ audio, setAudio ] = useState()

    let [ screen, setScreen ] = useState()
    let [ screenShareAvail, setScreenShareAvail ] = useState()

    let [ showModel, setModel ] = useState()

    let [ messages, setMessages ] = useState([])
    let [ message, setMessage ] = useState("")

    let [ newMessages, setNewMessages ] = useState(0)

    let [ askForUsername, setAskForUsername] = useState(true)
    let [ username, setUsername ] = useState("")
    
    const videoRef = useRef([])

    let [ videos, setVideos ] = useState([])

    // Todo ------
    // if(isChrome() === false) {

    // }


    // ---- 1st functions to grant perms
    const getPermissions = async () => {
        try {
            // Navigator - browser's object
            // mediaDevice - provides access to camera and microphones
            // getUserMedia - asks the user for permission to use a media input device
            const videoPerm = await navigator.mediaDevices.getUserMedia({video: true})

            if(videoPerm) {
                setVideoAvail(true)
            } else {
                setVideoAvail(false)
            }

            const audioPerm = await navigator.mediaDevices.getUserMedia({audio: true})

            if(audioPerm) {
                setAudioAvail(true)
            } else {
                setAudioAvail(false)
            }

            if(navigator.mediaDevices.getDisplayMedia) {
                setScreenShareAvail(true)
            } else {
                setScreenShareAvail(false)
            }

            if(videoAvail || audioAvail) {
                const userMediaStream = await navigator.mediaDevices.getUserMedia({video: videoAvail, audio: audioAvail})

                if(userMediaStream) {
                    window.localStream = userMediaStream;
                    if(localVideoRef.current) {
                        localVideoRef.current.srcObject = userMediaStream;
                    }
                }
            }

        } catch(err) {
            console.log(err)
        }
    }

    
    // ---- 1st useEffect
    useEffect(() => {
        getPermissions()
    }, [])


    let getUserMediaSuccess = (stream) => {

    }


    let getUserMedia = () => {
        if((video && videoAvail) || (audio && audioAvail)) {
            navigator.mediaDevices.getUserMedia({ video: video, audio: audio })
            .then(getUserMediaSuccess)
            .then((stream) => {})
            .catch((e) => console.log(e))
        }
        else {
            try {
                let tracks = localVideoRef.current.srcObject.getTracks()
                tracks.forEach(track => track.stop())
            } catch(e) {
                console.log(e)
            }
        }
    }

    // ---- 2nd useEffect
    useEffect(() => {
        if(video !== undefined && audio !== undefined) {
            getUserMedia();
        }
    },[audio, video])


    // ---- Todo 
    let gotMessageFromServer = (fromId, message) => {
        var signal = JSON.parse(message)

        if(fromId !== socketIdRef.current) {
            if(signal.sdp) {
                connections[fromId].setRemoteDescription(new RTCSessionDescription(signal.sdp)).then(() => {
                    if(signal.sdp.type === "offer") {

                        connections[fromId].createAnswer().then((description) => {
                            connections[fromId].setLocalDescription(description).then(() => {
                                socketIdRef.current.emit("signal", fromId, JSON.stringify({"sdp": connections[fromId].localDescription}
                                ))
                            }).catch(e => console.log(e))
                        }).catch(e => console.log(e))
                    }
                }).catch(e => console.log(e))
            }

            if(signal.ice) {
                connections[fromId].addIceCandidate(new RTCIceCandidate(signal.ice)).catch(e => console.log(e))
            }

        }
    }


    // ---- Todo
    let addMessage = () => {

    }

    let connectToSocketServer = () => {

        socketRef.current = io.connect(server_url, { secure: false })

        socketRef.current.on('signal', gotMessageFromServer)

        socketRef.current.on("connect", () => {
            
            socketRef.current.emit("join-call", window.location.href)

            socketIdRef.current = socketRef.current.id

            socketRef.current.on("chat-message", addMessage)

            socketRef.current.on("user-left", (id) => {
                setVideo((videos) => videos.filter((video) => video.socketId !== id))
            })

            socketRef.current.on("user-joined", (id, clients) => {
                clients.forEach((socketListId) => {

                    connections[socketListId] = new RTCPeerConnection(peerConfigConn)

                    // ice - interactive connection protocol
                    connections[socketListId].onicecandidate = (event) => {
                        if(event.candidate != null) {
                            socketRef.current.emit("signal", socketListId, JSON.stringify({'ice': event.candidate}))
                        }
                    }

                    connections[socketListId].onaddstream = (event) => {
                        
                        let videoExist = videoRef.current.find(video => video.socketId === socketListId)

                        if(videoExist) {
                            setVideo(videos => {
                                const updatedVideos = videos.map(video => 
                                    video.socketId === socketListId ? {...video, stream: event.stream} : video
                                )
                            })
                            videoRef.current = updatedVideos;
                            return updatedVideos;
                        } 

                        else {
                            
                            let newVideo = {
                                socketId: socketListId,
                                stream: event.stream,
                                autoPlay: true,
                                playsinline: true
                            }

                            setVideos(videos => {
                                const updatedVideos = [...videos, newVideo];
                                videoRef.current = updatedVideos;
                                return updatedVideos;
                            });
                        }
                    };

                    if(window.localStream !== undefined && window.localStream !== null) {
                        connections[socketListId].addStream(window.localStream)
                    }
                    else {
                        // Todo - when off the video, gets black screen
                        // let blackSilence = 
                    }
                })

                // checking and sending offer
                if(id === socketIdRef.current) {
                    for(let id2 in connections) {
                        if(id2 === socketIdRef.current) continue;

                        try {
                            connections[id2].addStream(window.localStream)
                        } catch(e) {
                            console.log(e)
                        }

                        connections[id2].createOffer()
                        .then((description) => {
                            connections[id2].setLocalDescription(description)
                            .then(() => {{ // sdp - session description
                                socketRef.current.emit("signal", id2, JSON.stringify({"sdp": connections[id2].localDescription}))
                            }})
                            .catch(e => console.log(e))
                        })
                    }
                }
            })
        })
    }
    

    // ---- 2nd 
    let getMedia = () => {
        setVideo(videoAvail);
        setAudio(audioAvail);
        connectToSocketServer();
    }


    let connect = () => {
        setAskForUsername(false);
        getMedia();
    }

  return (
    
    <div>
        {askForUsername === true ?
            <div>
                <h2>Enter into lobby</h2>
                {/* Import Textfield to use after installing M-UI */}
                <TextField id="outlined-basic" label="Username" value={username} onChange={e => setUsername(e.target.value)} variant="outlined" />

                <Button variant="contained" onClick={connect}>Connect</Button>

                <div>
                    <video ref={localVideoRef} autoPlay muted></video>
                </div>

            </div> 
            : 
            <></>
        }
    </div>
  )
}


