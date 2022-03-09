import React, { useState } from 'react'
import { deleteCat, deleteChannel, updateCat, updateChannel } from '../../http/Http'
import styles from './UpdateModal.module.css'
import { useSelector } from 'react-redux'

export const UpdateModal = (props) => {

    const { user } = useSelector(state => state.user)

    const [name, setName] = useState(props.channel ? props.currentChannel.name : props.currentCat.name)
    const [role, setRole] = useState(props.cat && props.currentCat.role)

    const handleDeleteChannel = async () => {
        await deleteChannel({ channelId: props.currentChannel.id })
        props.onClose();
    }

    const handleDeleteCat = async () => {
        await deleteCat({ catId: props.currentCat.id, userId: user.id })
        props.onClose();

    }

    const handleUpdateCat = async () => {
        await updateCat({ catId: props.currentCat.id, name, role })
        props.onClose();

    }

    const handleUpdateChannel = async () => {
        await updateChannel({ channelId: props.currentChannel.id, name })
        props.onClose();
    }

    return (
        <div className={styles.modalMask}>
            <div className={styles.modalBody}>
                <button onClick={props.onClose} className={styles.closeButton}>
                    <img src="/images/close.png" alt="close" />
                </button>
                <div className={styles.modalHeader}>
                    <h3 className={styles.heading}>
                        {props.channel ? "Edit Channel" : "Edit Category"}
                    </h3>
                    <input type="text" autoFocus="autoFocus" value={name} onChange={(e) => setName(e.target.value)} />
                    {props.cat &&
                        <>
                            <h3 className={styles.heading}>
                                Edit category role
                            </h3>
                            <input type="text" value={role} onChange={(e) => setRole(e.target.value)} />
                        </>
                    }
                </div>
                <div className={styles.modalFooter}>
                    <div className={styles.code}>
                        <button className={`${styles.footerButton} ${styles.delete}`} onClick={props.channel ? handleDeleteChannel : handleDeleteCat}>{props.channel ? "Delete Channel" : "Delete Category"}</button>
                        <button className={`${styles.footerButton} ${styles.update}`} onClick={props.channel ? handleUpdateChannel : handleUpdateCat}>{props.channel ? "Update Channel" : "Update Category"}</button>
                    </div>
                    <h2 className={styles.validation}>{props.channel ? "**These updates will delete everything in your channel" : "**These updates will delete everything in your category."}</h2>
                </div>
            </div>
        </div>
    )
}
