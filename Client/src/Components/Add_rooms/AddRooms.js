import React, { useState } from 'react'
import { useHistory } from "react-router-dom"
import styles from "./AddRooms.module.css"
import { useSelector } from 'react-redux';
import { TextInput } from '../../Shared Components/TextInput/TextInput'
import { addRole, createRoom as create, sendCat, sendChannels, sendRoles, updateCat, UserRoles, verifyCode } from '../../http/Http'

import { RiVoiceprintFill } from "react-icons/ri";
import { FaChevronDown } from "react-icons/fa";
import { BsChatText } from "react-icons/bs";

export const AddRooms = (props) => {

    const history = useHistory();

    const { user } = useSelector((state) => state.user);
    const [showModal, setShowModal] = useState(false)
    const [showJoinModal, setShowJoinModal] = useState(false)
    const [server, setServer] = useState(`${props.room ? `${user.name}'s Server` : ""}`);
    const [role, setRole] = useState("public")

    const [selectedOption, setSelectedOption] = useState("text")
    const [selectedCat, setSelectedCat] = useState(null)
    const [selectedCatId, setSelectedCatId] = useState(null)

    async function createRoom() {
        try {
            if (!server) return;
            const data = await create({ server, dm: false, members: user.id, roles: ["public", "admin"] });
            const res = await sendCat({ roomId: data.data.id, name: "text channels", role: "public" })
            await sendRoles({ roomId: data.data.id, userId: user.id, role: ["admin", "public"] })
            await sendChannels({ categoryId: res.data.id, name: "general", type: "text", roomId: data.data.id })
            history.push(`/grp/${data.data.id}`)
            props.onClose();
        } catch (err) {
            console.log(err.message);
            props.onClose();
        }
    }

    const createCat = async () => {
        if (!server) return;
        await sendCat({ roomId: props.currentRoom?._id, name: server, role })
        if (role !== "public") {
            await addRole({ roomId: props.currentRoom?._id, userId: user.id, role })
        }
        props.onClose();
    }

    const createChannel = async () => {
        if (!server || !selectedCat || !selectedOption) return;
        await sendChannels({ categoryId: selectedCatId, name: server, type: selectedOption, roomId: props.currentRoom?._id })
        props.onClose();
    }

    const onValueChange = (e) => {
        setSelectedOption(e.target.value)
    }

    const handleCat = (e) => {
        setSelectedCat(e.target.value)
        const index = e.target.selectedIndex;
        const el = e.target.childNodes[index]
        const option = el.getAttribute('id');
        setSelectedCatId(option);
    }

    const handleAddServer = () => {
        setShowModal(true);
    }

    const joinServer = () => {
        setShowJoinModal(true)
    }

    const Codetojoin = async () => {
        const updatedData = await verifyCode({ code: server, userId: user.id })
        const userRole = await UserRoles({ roomId: updatedData.data._id, userId: user.id })
        if (userRole.data[0] === undefined) {
            await sendRoles({ roomId: updatedData.data._id, userId: user.id, role: ["public"] })
        }
        props.onClose()
        history.push(`/grp/${updatedData.data._id}`)
    }

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            if (props.invite) {
                Codetojoin();
            }
            else if (props.room) {
                createRoom();
            }
            else if (props.category) {
                createCat();
            }
            else if (props.channel) {
                createChannel();
            }
        }
    }

    const createRole = async () => {
        await updateCat({ catId: selectedCatId, role })
        props.onClose()
    }

    const addRoles = async () => {
        await addRole({ roomId: props.roomDet, userId: props.userDet._id, role: selectedCat })
        props.onClose();
    }

    return (
        <>
            <div className={styles.modalMask}>
                <div className={styles.modalBody}>
                    <button onClick={props.onClose} className={styles.closeButton}>
                        <img src="/images/close.png" alt="close" />
                    </button>
                    <div className={styles.modalHeader}>
                        {props.options &&
                            <div className={styles.own__channel} onClick={handleAddServer}>
                                <h3 className={styles.heading}>Create My Own</h3>
                                <FaChevronDown className={styles.right__icon} />
                            </div>
                        }
                        {props.channel &&
                            <>
                                <div className={styles.select__channeltype}>
                                    <h3 className={`${styles.heading} ${styles.type}`}>CHANNEL TYPE</h3>
                                    <div className={styles.text__channel}>
                                        <input
                                            type="radio"
                                            value="text"
                                            checked={selectedOption === "text"}
                                            onChange={onValueChange}
                                        />
                                        <BsChatText className={styles.channel__type} />
                                        Text Channel
                                    </div>
                                    <div className={styles.voice__channel}>
                                        <input
                                            type="radio"
                                            value="voice"
                                            checked={selectedOption === "voice"}
                                            onChange={onValueChange}
                                        />
                                        <RiVoiceprintFill className={styles.channel__type} />
                                        Voice Channel
                                    </div>
                                </div>
                                <div className={styles.select__cat}>
                                    <select className={styles.cat__optionsselect} defaultValue={selectedCat}
                                        onChange={handleCat} >
                                        <option className={styles.cat__options} value="~select~">~select~</option>
                                        {props.roomCategories.map((cat, idx) =>
                                            <option key={idx} className={styles.cat__options} value={cat.name} id={cat.id}>{cat.name}</option>
                                        )}
                                    </select>
                                </div>
                            </>
                        }
                        {props.role &&
                            <>
                                <h3 className={`${styles.heading} ${styles.type}`}>CHANNEL TYPE</h3>
                                <div className={styles.select__cat}>
                                    <select className={styles.cat__optionsselect} defaultValue={selectedCat}
                                        onChange={handleCat} >
                                        <option className={styles.cat__options} value="~select~">~select~</option>
                                        {props.roomCategories.map((cat, idx) =>
                                            <option key={idx} className={styles.cat__options} value={cat.name} id={cat.id}>{cat.name}</option>
                                        )}
                                    </select>
                                </div>
                            </>
                        }
                        {props.addRole &&
                            <>
                                <h3 className={`${styles.heading} ${styles.type}`}>ROLE</h3>
                                <div className={styles.select__cat}>
                                    {props.allRoles.length !== 0 ?
                                        <select className={styles.cat__optionsselect} defaultValue={selectedCat}
                                            onChange={handleCat} >
                                            <>
                                                <option className={styles.cat__options} value="~select~">~select~</option>
                                                {props.allRoles.map((role, idx) =>
                                                    <option key={idx} className={styles.cat__options} value={role} id={idx}>{role}</option>
                                                )}
                                            </>
                                        </select>
                                        :
                                        <p>{props.userDet.name} has all the roles in this room</p>
                                    }
                                </div>
                            </>
                        }
                        {!props.options && !props.role && !props.addRole &&
                            <>
                                <h3 className={styles.heading}>
                                    {props.field}
                                </h3>
                                <TextInput
                                    fullwidth="true"
                                    value={server}
                                    onChange={(e) => setServer(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                />
                            </>
                        }
                        {(props.category || props.role) &&
                            <>
                                <h3 className={styles.heading}>
                                    Role
                                </h3>
                                <TextInput
                                    fullwidth="true"
                                    value={role}
                                    onChange={(e) => setRole(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                />
                            </>
                        }
                    </div>
                    <div className={styles.modalFooter}>
                        {props.room &&
                            <h2>Start a room, the type you want</h2>
                        }
                        {props.channel &&
                            <h2>Create a channel in a particular category</h2>
                        }
                        {props.role &&
                            <h2>Create a role for a particular category</h2>
                        }
                        {props.options &&
                            <h2>Have an Invite Code already?</h2>
                        }
                        {props.addRole &&
                            <h2>Add a role to {props.userDet.name}</h2>
                        }
                        <button
                            onClick={props.room ? createRoom : props.category ? createCat : props.channel ? createChannel : props.options ? joinServer : props.invite ? Codetojoin : props.role ? createRole : props.addRole ? addRoles : null}
                            className={styles.footerButton}
                        >
                            <span>{props.options ? "Join a server" : props.addRole ? "Add Role" : "Let's go"}</span>
                        </button>
                    </div>
                </div>
            </div>
            {showModal && <AddRooms field="Server's Name" room onClose={() => setShowModal(false)} />}
            {showJoinModal && <AddRooms field="Invite code" invite onClose={() => setShowJoinModal(false)} />}
        </>
    )
}
