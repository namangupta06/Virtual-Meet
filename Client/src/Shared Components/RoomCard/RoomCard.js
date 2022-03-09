import React, { useState, useEffect } from 'react'
import { getCsBId, getUs } from '../../http/Http'
import styles from "./RoomCard.module.css"
import { useSelector } from 'react-redux'

export const RoomCard = (props) => {

    const { user } = useSelector((state) => state.user)

    const [friend, setFriend] = useState(null)
    const [convData, setConvData] = useState(null)

    useEffect(() => {

        const getConvData = async () => {
            const res = await getCsBId(props.conv?._id);
            setConvData(res.data)
        }

        getConvData();
    }, [props.conv])


    useEffect(() => {
        const friendId = convData?.members?.find((m) => m !== user.id)
        const getFriendUId = async () => {
            if (friendId) {
                const res = await getUs(friendId);
                setFriend(res.data)
            }
        }

        getFriendUId();
    }, [user, convData])

    return (
        <div className={styles.card} onClick={props.onClick}>
            <h3 className={styles.topic}>{props.room ? props.room.server : friend?.name}</h3>
            <div className={styles.peopleCount}>
                {props.room && !props.room.dm &&
                    <>
                        <span className={styles.people__room}>{props.room.members.length}</span>
                        <img src="/images/user-icon.png" alt="user-icon" />
                    </>
                }
                {props.room && props.room.dm &&
                    <>
                        <span className={styles.people__room}>{props.dmConv.length}</span>
                        <img src="/images/user-icon.png" alt="user-icon" />
                    </>
                }
            </div>
        </div>
    )
}
