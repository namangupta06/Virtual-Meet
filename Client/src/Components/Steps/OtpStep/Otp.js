import React, { useState } from 'react'
import styles from "./Otp.module.css"

import { Card } from "../../../Shared Components/Card/Card"
import { Button } from "../../../Shared Components/Button/Button"
import { TextInput } from '../../../Shared Components/TextInput/TextInput'

import { verifyOtp } from '../../../http/Http'
import { useSelector } from 'react-redux'
import { useDispatch } from "react-redux"
import { setAuth } from '../../../Store/AuthSlice'

export const Otp = () => {

    const [otp, setOtp] = useState('');
    const dispatch = useDispatch();
    const { phone, hash } = useSelector((state) => state.user.otp)

    const Submit = async () => {
        if (!otp || !phone || !hash) return;
        try {
            const { data } = await verifyOtp({ phone, otp, hash })
            console.log(data)
            dispatch(setAuth(data))
        } catch (error) {
            console.log(error)
        }
    }

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            Submit();
        }
    }

    return (
        <div className={styles.cardWrapper}>
            <Card
                title="Enter the code we just sent you"
                icon="otp"
            >
                <TextInput
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    onKeyDown={handleKeyDown}
                />
                <div className={styles.actionButtonWrap}>
                    <Button text="Next" onClick={Submit} />
                </div>
            </Card>
        </div>
    )
}
