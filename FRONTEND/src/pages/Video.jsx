import React, { useRef, useState } from 'react'


const server_url = "http://localhost:8000";

var connections = {}

const peerConfigConn = {
    "iceServers": [
        { "urls": "stun:stun.l.google.com:19302" }
    ]
}

function Video() {

    var socketRef = useRef()
    let socketIdRef = useRef()
    let localVideoRef = useRef()
    
    let [ videoAvail, setVideoAvail ] = useState(true)
    let [ audioAvail, setAudioAvail ] = useState(true)
    
    let [ video, setVideo ] = useState()
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



  return (
    <div>
        {askForUsername === true ?

            <div>


            </div> 
            : 
            <></>

        }
    </div>
  )
}

export default Video
