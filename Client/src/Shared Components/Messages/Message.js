import React from 'react'
import styles from "./Message.module.css"

import { format } from "timeago.js"

export const Message = (props) => {

    return (
        <div className={`${styles.messages} ${props.own && styles.own}`}>
            <div className={styles.message__top}>
                <div className={styles.message__writer}>
                    {props.mssg.senderName}
                </div>
                <div className={styles.message__time}>
                    {format(props.mssg.createdAt)}
                </div>
            </div>
            <p className={styles.message__content}>
                {props.mssg.message}
            </p>
        </div>
    )
}
