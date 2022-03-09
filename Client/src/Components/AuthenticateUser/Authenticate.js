import React, { useState } from 'react'

import { Otp } from '../Steps/OtpStep/Otp';
import { Phone } from '../Steps/PhoneEmailStep/Phone/Phone';

const steps = {
    1: Phone,
    2: Otp,
};

export const Authenticate = () => {

    const [step, setStep] = useState(1);
    const Step = steps[step];

    const onClick = () => {
        setStep(step + 1);
    }

    return (
        <Step onClick={onClick} />
    )
}
