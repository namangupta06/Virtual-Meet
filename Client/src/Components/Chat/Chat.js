import React, { useState, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { getCsBId, getMs, getUs, sendMssgs } from "../../http/Http";
import { Message } from "../../Shared Components/Messages/Message";
import Picker from "emoji-picker-react";
import { io } from "socket.io-client";
import Peer from "simple-peer";
import styles from "./Chat.module.css";
import { useHistory } from "react-router-dom";

import { GoSmiley } from "react-icons/go";
import { BiPhoneCall } from "react-icons/bi";
import { MdKeyboardBackspace } from "react-icons/md";
import { BsCameraVideo } from "react-icons/bs";
import { BsCameraVideoOff } from "react-icons/bs";
import { AiOutlineAudio } from "react-icons/ai";
import { AiOutlineAudioMuted } from "react-icons/ai";
import { MdOutlineScreenShare } from "react-icons/md";
import { FcEndCall } from "react-icons/fc";
import { FiPaperclip } from "react-icons/fi";

export const Chat = () => {
    var url = window.location.pathname;
    var id = url.substring(url.lastIndexOf("/") + 1);

    const [currentChat, setCurrentChat] = useState();
    const [friend, setfriend] = useState(null);
    const [messages, setMessages] = useState([]);
    const socket = useRef();
    const [arrivalMessage, setArrivalMessage] = useState(null);
    const scrollRef = useRef();

    const [newMssg, setNewMssg] = useState("");
    const [emojisOpen, setEmojisOpen] = useState(false);

    const { user } = useSelector((state) => state.user);
    const history = useHistory();

    const onEmojiClick = (event, emojiObject) => {
        event.preventDefault();
        setNewMssg(newMssg + emojiObject.emoji);
    };

    const myVideo = useRef();
    const userVideo = useRef();
    const connectionRef = useRef();
    const screenTrackRef = useRef();

    const [stream, setStream] = useState(null);
    const [me, setMe] = useState("");
    const [call, setCall] = useState({});
    const [callAnswered, setCallAnswered] = useState(false);
    const [callEnded, setCallEnded] = useState(false);
    const [myVdoStatus, setMyVdoStatus] = useState(true);
    const [myaudioStatus, setMyaudioStatus] = useState(true);
    const [screenShare, setScreenShare] = useState(false)
    const [callStarted, setCallStarted] = useState(false);

    useEffect(() => {
        socket.current = io("ws://localhost:8900");

        navigator.mediaDevices
            .getUserMedia({
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                },
                video: true,
            })
            .then((currentStream) => {
                setStream(currentStream);
                myVideo.current.srcObject = currentStream;
            });

        socket.current.on("me", (id) => setMe(id));

        socket.current.on("callfriend", ({ from, name: callerName, signal }) => {
            setCall({ isReceivedCall: true, from, name: callerName, signal });
        });

        socket.current.on("endcall", () => {
            connectionRef.current.destroy();
            window.location.reload();
        })

        socket.current.on("callDeclined", () => {
            setCallStarted(false);
            window.location.reload();
        })
    }, []);

    const declineCall = () => {
        socket.current.emit("callDeclined", { calldeclineId: friend?._id })
        window.location.reload();
    }

    const answerCall = () => {
        setCallAnswered(true);
        setCallStarted(false);

        const peer = new Peer({ initiator: false, trickle: false, stream });

        peer.on("signal", (data) => {
            socket.current.emit("callanswered", { signal: data, to: call.from });
        });

        peer.on("stream", (currentStream) => {
            userVideo.current.srcObject = currentStream;
        });

        peer.signal(call.signal);

        connectionRef.current = peer;
    };

    const callUser = (id) => {
        const peer = new Peer({ initiator: true, trickle: false, stream });

        peer.on("signal", (data) => {
            socket.current.emit("callfriend", {
                userToCall: id,
                signalData: data,
                from: me,
                name: user.name
            });
        });

        peer.on("stream", (currentStream) => {
            userVideo.current.srcObject = currentStream;
        });

        socket.current.on("callanswered", (signal) => {
            setCallAnswered(true);
            setCallStarted(false);

            peer.signal(signal);
        });

        connectionRef.current = peer;
    };

    const leaveCall = () => {
        setCallEnded(true);
        connectionRef.current.destroy();
        socket.current.emit("endcall", { userToendCall: friend?._id });
        window.location.reload();
    };

    useEffect(() => {
        socket.current.on("getMessage", (data) => {
            setArrivalMessage({
                sender: data.senderId,
                senderName: data.senderName,
                message: data.message,
                createdAt: Date.now(),
            });
        });
    }, []);

    useEffect(() => {
        arrivalMessage &&
            currentChat?.members.includes(arrivalMessage.sender) &&
            setMessages((prev) => [...prev, arrivalMessage]);
    }, [arrivalMessage, currentChat]);

    useEffect(() => {
        const chat = currentChat?.members.find((m) => m !== user.id);

        if (chat) {
            const getFrined = async () => {
                const Friend = await getUs(chat);
                setfriend(Friend.data);
            };

            getFrined();
        }
    }, [user, currentChat]);

    useEffect(() => {
        socket.current.emit("addUser", user.id);
    }, [user]);

    useEffect(() => {
        const getConversation = async () => {
            try {
                const res = await getCsBId(id);
                setCurrentChat(res.data);
            } catch (error) {
                console.log(error);
            }
        };

        getConversation();
    }, [id]);

    useEffect(() => {
        if (currentChat) {
            const getMessages = async () => {
                try {
                    const res = await getMs(currentChat?._id);
                    setMessages(res.data);
                } catch (error) {
                    console.log(error);
                }
            };
            getMessages();
        }
    }, [currentChat]);

    const sendMssg = async () => {
        if (!newMssg) return;
        const userCs = {
            sender: user.id,
            senderName: user.name,
            message: newMssg,
            conversationId: currentChat?._id,
        };

        const receiverId = currentChat?.members.find(
            (member) => member !== user.id
        );

        socket.current.emit("sendMessage", {
            senderId: user.id,
            senderName: user.name,
            receiverId,
            message: newMssg,
        });

        try {
            const res = await sendMssgs(userCs);
            setNewMssg("");
            setMessages([...messages, res.data]);
        } catch (error) {
            console.log("message not sent");
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter") {
            sendMssg();
        }
    };

    useEffect(() => {
        scrollRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleBack = () => {
        history.goBack();
    };

    const handleCallUser = () => {
        setCallStarted(true);
        callUser(friend?._id);
    };

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

                        myVideo.current.srcObject = stream;
                        setScreenShare(false);
                    };

                    myVideo.current.srcObject = currentStream;
                    screenTrackRef.current = screenTrack;
                    setScreenShare(true);
                }).catch((error) => {
                    console.log("No stream for sharing")
                });
        } else {
            screenTrackRef.current.onended();
        }
    };

    return (
        <div className={styles.messenger}>
            <div className={styles.chat__Box}>
                <div className={styles.chat__wrapper}>
                    <div className={styles.dm__navbar}>
                        <span className={styles.go__back} onClick={handleBack}>
                            <MdKeyboardBackspace className={styles.go__back__icon} />
                        </span>
                        <div className={styles.friend}>@ {friend?.name}</div>
                        {callAnswered && !callEnded && call.isReceivedCall ?
                            <FcEndCall onClick={leaveCall} className={styles.phone__call} /> :
                            <BiPhoneCall
                                className={styles.phone__call}
                                onClick={handleCallUser}
                            />
                        }
                    </div>
                    <div className={styles.calling__area}>
                        {callAnswered && !callEnded && (
                            <div className={styles.video__containers}>
                                <video
                                    className={styles.video}
                                    ref={userVideo}
                                    autoPlay
                                    playsInline
                                />
                            </div>
                        )}
                        <div className={styles.me__calling}>
                            <video
                                className={styles.video}
                                ref={myVideo}
                                autoPlay
                                playsInline
                            />
                        </div>
                        {callStarted && (
                            <div className={styles.calling}>
                                calling....
                            </div>
                        )}
                        {call.isReceivedCall && !callAnswered && (
                            <div className={styles.calling}>
                                <h1>{call.name} is calling....</h1>
                                <div className={styles.calling__btns}>
                                    <button onClick={answerCall} className={styles.accept__btn}>Accept</button>
                                    <button onClick={declineCall} className={styles.decline__btn}>Decline</button>
                                </div>
                            </div>
                        )}
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
                        {callAnswered && !callEnded &&
                            <>
                                <div className={styles.sett__cover}>
                                    <MdOutlineScreenShare onClick={sharemyScreen} className={styles.set__icons} />
                                </div>
                                <div className={styles.sett__cover}>
                                    <FcEndCall onClick={leaveCall} className={styles.set__icons} />
                                </div>
                            </>
                        }
                    </div>
                    <div className={styles.chatBox__top}>
                        {messages.map((msg, idx) => (
                            <div key={idx} ref={scrollRef}>
                                <Message mssg={msg} own={msg.sender === user.id} />
                            </div>
                        ))}
                    </div>
                    {emojisOpen && (
                        <div className={styles.emojis}>
                            <Picker
                                onEmojiClick={onEmojiClick}
                                disableAutoFocus
                                disableSkinTonePicker
                            />
                        </div>
                    )}
                    <div className={styles.send__chat}>
                        <GoSmiley
                            className={styles.emoji__selection}
                            onClick={() => setEmojisOpen(!emojisOpen)}
                        />
                        <FiPaperclip />
                        <input
                            value={newMssg}
                            onClick={() => setEmojisOpen(false)}
                            className={styles.write__mssg}
                            autoFocus="autoFocus"
                            type="message"
                            placeholder={`Message @${friend?.name}`}
                            onChange={(e) => setNewMssg(e.target.value)}
                            onKeyDown={handleKeyDown}
                        />
                        <img
                            className={styles.send__mssg}
                            src="/images/send-icon.png"
                            alt=""
                            onClick={sendMssg}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};
