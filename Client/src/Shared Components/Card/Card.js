import React from 'react'
import styles from './Card.module.css'

export const Card = (props) => {
    return (
        <div className={styles.card}>
            <div className={styles.headingWrapper}>
                {props.icon && <img src={`/images/${props.icon}.png`} alt="logo" />}
                <h1 className={styles.heading}>{props.title}</h1>
            </div>
            {props.children}
        </div>
    )
}
