const crypto = require('crypto');
const HashService = require('./HashService');

const smsSid = process.env.SMS_SID;
const smsAuthToken = process.env.SMS_AUTH_TOKEN;
const twilio = require('twilio')(smsSid, smsAuthToken, {
    lazyLoading: true,
});

class OtpService {

    async generateOtp() {
        const otp = crypto.randomInt(100000, 999999)
        return otp;
    }

    async sendBySms(phone, otp) {
        //const usePhone = "+91" + phone;
        return await twilio.messages.create({
            to: phone,
            from: process.env.SMS_FROM,
            body: `<#> ${otp} is your OTP for accessing Virtual Meet Account`
        })
    }

    verifyOtp(data, hash) {
        return (hash === HashService.hashOtp(data))
    }

}

module.exports = new OtpService();