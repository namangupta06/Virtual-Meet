import React, { useState } from 'react'
import styles from "./Avatar.module.css"

import { Button } from '../../../Shared Components/Button/Button'
import { Card } from '../../../Shared Components/Card/Card'

import { useDispatch, useSelector } from "react-redux"
import { setAvatar } from '../../../Store/userDetails'
import { activateUser } from '../../../http/Http'
import { setAuth } from '../../../Store/AuthSlice'
import { Loader } from "../../../Shared Components/Loader/Loader"
import { updateRoom } from '../../../http/Http'

export const Avatar = (props) => {

    const dispatch = useDispatch();
    const { user } = useSelector((state) => state.user);
    const { fullName, avatar } = useSelector((state) => state.details)

    const [pic, setPic] = useState(avatar !== "" ? avatar : "images/default_bg.png")

    const [loading, setLoading] = useState(false)

    const changeImage = (e) => {
        const image = e.target.files[0];
        const reader = new FileReader();
        reader.readAsDataURL(image);
        reader.onloadend = () => {
            setPic(reader.result);
            dispatch(setAvatar(reader.result));
        }
    }

    const submit = async () => {
        if (!fullName) return;
        setLoading(true)
        try {
            const { data } = await activateUser({ fullName, avatar });
            if (data.auth) {
                dispatch(setAuth(data))
            }
            await updateRoom({ dm: true, members: user.id });
        } catch (error) {
            console.log(error)
        } finally {
            setLoading(false)
        }
    }

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            submit();
        }
    }

    if (loading) return <Loader message="Activation in progress....." />
    return (
        <div className={styles.cardWrapper}>
            <Card title={`Hey! ${fullName}`}>
                <div className={styles.avatarWrapper} style={{ backgroundImage: `url(${pic})`, backgroundSize: "cover" }}>
                </div>
                <div>
                    <input
                        onChange={changeImage}
                        id="avatarInput"
                        type="file"
                        className={styles.avatarInput}
                        onKeyDown={handleKeyDown}
                    />
                    <label className={styles.avatarLabel} htmlFor="avatarInput">
                        Upload a profile picture
                    </label>
                </div>
                <div>
                    <Button onClick={submit} text="Next" />
                </div>
            </Card>
        </div>
    )
}
