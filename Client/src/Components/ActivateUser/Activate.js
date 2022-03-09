import React, { useState } from 'react'
import { Name } from "../Steps/NameStep/Name"
import { Avatar } from "../Steps/AvatarStep/Avatar"

const steps = {
    1: Name,
    2: Avatar,
};

export const Activate = () => {

    const [step, setStep] = useState(1);
    const Step = steps[step];

    const onClick = () => {
        setStep(step + 1);
    }

    return (
        <Step onClick={onClick} />
    )
}
