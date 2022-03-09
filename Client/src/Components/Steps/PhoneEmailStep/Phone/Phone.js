import React, { useState } from 'react'
import styles from "../PhoneEmail.module.css"

import { Card } from "../../../../Shared Components/Card/Card"
import { Button } from "../../../../Shared Components/Button/Button"
import { TextInput } from '../../../../Shared Components/TextInput/TextInput'
import { sendOtp } from '../../../../http/Http'
import { useDispatch } from "react-redux"
import { SendOtp } from '../../../../Store/AuthSlice'

export const Phone = (props) => {

    const [phoneNumber, setPhoneNumber] = useState('')
    const dispatch = useDispatch();

    const send = async () => {
        if (!phoneNumber) return;
        const { data } = await sendOtp({ phone: phoneNumber })
        dispatch(SendOtp({ phone: data.phone, hash: data.hash }))
        console.log(data)
        props.onClick()
    }

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            send();
        }
    }

    return (
        <div className={styles.cardWrapper}>
            <Card title="Enter you phone number" icon="phone">
                <TextInput
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    onKeyDown={handleKeyDown}
                />
                <div>
                    <div className={styles.actionButtonWrap}>
                        <Button text="Next" onClick={send} />
                    </div>
                </div>
            </Card>
        </div>
    )
}
