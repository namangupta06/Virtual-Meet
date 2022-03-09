import React, { useState } from 'react'
import { Card } from '../../../Shared Components/Card/Card'
import { TextInput } from '../../../Shared Components/TextInput/TextInput'
import { Button } from '../../../Shared Components/Button/Button'
import styles from "./Name.module.css"
import { useDispatch, useSelector } from "react-redux"
import { setFullName } from '../../../Store/userDetails'

export const Name = (props) => {

    const dispatch = useDispatch();
    const { fullName } = useSelector((state) => state.details)

    const [name, setName] = useState(fullName)

    const sendName = () => {
        if (!name) {
            return;
        }
        dispatch(setFullName(name))
        props.onClick()
    }

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            sendName();
        }
    }

    return (
        <div className={styles.cardWrapper}>
            <Card title="Enter a Username">
                <TextInput
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    onKeyDown={handleKeyDown}
                />
                <div>
                    <div className={styles.actionButtonWrap}>
                        <Button text="Next" onClick={sendName} />
                    </div>
                </div>
            </Card>
        </div>
    )
}
