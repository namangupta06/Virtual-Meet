import React from 'react'
import styles from './TextInput.module.css'

export const TextInput = (props) => {
    return (
        <div>
            <input className={styles.input} autoFocus="autoFocus" style={{ width: props.fullwidth === 'true' ? '100%' : 'inherit' }} type="text" {...props} />
        </div>
    )
}
