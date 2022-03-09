import React from 'react'
import styles from './Button.module.css'

export const Button = (props) => {
    return (
        <button onClick={props.onClick} className={styles.button}>
            <span>{props.text}</span>
            <img
                className={styles.arrow}
                src="/images/arrow-forward.png"
                alt="arrow"
            />
        </button>
    )
}
