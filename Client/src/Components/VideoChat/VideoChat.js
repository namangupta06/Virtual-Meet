import React, { useEffect, useState, useRef } from 'react'
import styles from './VideoChat.module.css'
import io from "socket.io-client";
import Peer from "simple-peer";

import { BsCameraVideo } from "react-icons/bs";
import { BsCameraVideoOff } from "react-icons/bs";
import { AiOutlineAudio } from "react-icons/ai";
import { AiOutlineAudioMuted } from "react-icons/ai";
import { MdOutlineScreenShare } from "react-icons/md";
import { FcEndCall } from "react-icons/fc";

const Video = (props) => {
    const ref = useRef();

    useEffect(() => {
        props.peer.on("stream", stream => {
            ref.current.srcObject = stream;
        })
    }, [props]);

    return (
        <video className={styles.video} playsInline autoPlay ref={ref} />
    );
}

export const VideoChat = (props) => {

    const [peers, setPeers] = useState([]);
    const socketRef = useRef();
    const connectionRef = useRef();
    const userVideo = useRef();
    const peersRef = useRef([]);
    const screenTrackRef = useRef();
    const channelId = props.channelId;
    const [stream, setStream] = useState(null);

    const [myVdoStatus, setMyVdoStatus] = useState(true);
    const [myaudioStatus, setMyaudioStatus] = useState(true);
    const [screenShare, setScreenShare] = useState(false)

    useEffect(() => {
        socketRef.current = io("ws://localhost:8900");
        navigator.mediaDevices.getUserMedia({
            video: true,
            audio: {
                echoCancellation: true,
                noiseSuppression: true,
            },
        }).then(stream => {
            setStream(stream);
            userVideo.current.srcObject = stream;
            socketRef.current.emit("join room", channelId);
            socketRef.current.on("all users", users => {
                const peers = [];
                users.forEach(userID => {
                    const peer = createPeer(userID, socketRef.current.id, stream);
                    peersRef.current.push({
                        peerID: userID,
                        peer,
                    })
                    peers.push({
                        peerID: userID,
                        peer,
                    });
                })
                setPeers(peers);
            })

            socketRef.current.on("user joined", payload => {
                const peer = addPeer(payload.signal, payload.callerID, stream);
                peersRef.current.push({
                    peerID: payload.callerID,
                    peer,
                })

                const peerObj = {
                    peerID: payload.callerID,
                    peer,
                }

                setPeers(users => [...users, peerObj]);
            });

            socketRef.current.on("user left", id => {
                const peerObj = peersRef.current.find(p => p.peerID === id);
                if (peerObj) {
                    peerObj.peer.destroy();
                }

                const peerr = peersRef.current.filter(p => p.peerID !== id);
                peersRef.current = peerr;
                setPeers(peerr);
            })

            socketRef.current.on("receiving returned signal", payload => {
                const item = peersRef.current.find(p => p.peerID === payload.id);
                item.peer.signal(payload.signal);
            });
        })
    }, [])

    const createPeer = (userToSignal, callerID, stream) => {
        const peer = new Peer({
            initiator: true,
            trickle: false,
            stream,
        });

        peer.on("signal", signal => {
            socketRef.current.emit("sending signal", { userToSignal, callerID, signal })
        })
        connectionRef.current = peer;
        return peer;
    }

    const addPeer = (incomingSignal, callerID, stream) => {
        const peer = new Peer({
            initiator: false,
            trickle: false,
            stream,
        })

        peer.on("signal", signal => {
            socketRef.current.emit("returning signal", { signal, callerID })
        })

        peer.signal(incomingSignal);
        connectionRef.current = peer;
        return peer;
    }

    const cameraOff = () => {
        const videoTrack = stream.getTracks().find(track => track.kind === "video");
        if (videoTrack.enabled) {
            videoTrack.enabled = false;
            setMyVdoStatus(false);
        }
        else {
            videoTrack.enabled = true;
            setMyVdoStatus(true);
        }
    }

    const audioOff = () => {
        const audioTrack = stream.getTracks().find(track => track.kind === "audio");
        if (audioTrack.enabled) {
            audioTrack.enabled = false;
            setMyaudioStatus(false);
        }
        else {
            audioTrack.enabled = true;
            setMyaudioStatus(true);
        }
    }

    const sharemyScreen = () => {

        if (screenShare) {
            screenTrackRef.current.onended();
            setScreenShare(false);
        }

        if (!screenShare) {
            navigator.mediaDevices
                .getDisplayMedia({ cursor: true })
                .then((currentStream) => {
                    const screenTrack = currentStream.getTracks()[0];


                    // replaceTrack (oldTrack, newTrack, oldStream);
                    connectionRef.current.replaceTrack(
                        connectionRef.current.streams[0]
                            .getTracks()
                            .find((track) => track.kind === 'video'),
                        screenTrack,
                        stream
                    );

                    // Listen click end
                    screenTrack.onended = () => {
                        connectionRef.current.replaceTrack(
                            screenTrack,
                            connectionRef.current.streams[0]
                                .getTracks()
                                .find((track) => track.kind === 'video'),
                            stream
                        );

                        userVideo.current.srcObject = stream;
                        setScreenShare(false);
                    };

                    userVideo.current.srcObject = currentStream;
                    screenTrackRef.current = screenTrack;
                    setScreenShare(true);
                }).catch(() => {
                    console.log("No stream for sharing")
                });
        } else {
            screenTrackRef.current.onended();
        }
    };

    const leaveCall = () => {
        socketRef.current.emit("call ended");
        window.location.reload();
    }

    return (
        <div className={styles.video__section}>
            <div className={styles.video__containers}>
                <video className={styles.video} ref={userVideo} autoPlay playsInline />
                {console.log(peers)}
                {peers.map((peer) => {
                    return (
                        <Video key={peer.peerID} peer={peer.peer} />
                    );
                })}
            </div>
            <div className={styles.settings__area}>
                <div className={`${styles.sett__cover} ${!myVdoStatus && styles.cut}`}>
                    {myVdoStatus ?
                        <BsCameraVideo onClick={cameraOff} className={styles.set__icons} />
                        :
                        <BsCameraVideoOff onClick={cameraOff} className={styles.set__icons} />
                    }
                </div>
                <div className={`${styles.sett__cover} ${!myaudioStatus && styles.cut}`}>
                    {myaudioStatus ?
                        <AiOutlineAudio onClick={audioOff} className={styles.set__icons} />
                        :
                        <AiOutlineAudioMuted onClick={audioOff} className={styles.set__icons} />
                    }
                </div>
                <>
                    <div className={styles.sett__cover}>
                        <MdOutlineScreenShare onClick={sharemyScreen} className={styles.set__icons} />
                    </div>
                    <div className={styles.sett__cover}>
                        <FcEndCall onClick={leaveCall} className={styles.set__icons} />
                    </div>
                </>
            </div>
        </div>
    )
}
