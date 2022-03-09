const HashService = require('../Services/HashService');
const otpService = require('../Services/otpService');
const TokenService = require('../Services/TokenService');
const UserService = require('../Services/UserService');
const userDto = require("../dtos/userDto")
const Jimp = require('jimp')
const path = require('path');

class AuthController {

    async sendOtp(req, res) {
        const { phone } = req.body;

        if (!phone) {
            res.status(400).json({ message: "Phone field is required" })
        }

        const Otp = await otpService.generateOtp();

        const timeleap = 1000 * 60 * 5;
        const expiryTime = Date.now() + timeleap;

        const hashData = `${phone}.${Otp}.${expiryTime}`

        const hash = HashService.hashOtp(hashData)

        try {
            //await otpService.sendBySms(phone, Otp)
            res.json({
                hash: `${hash}.${expiryTime}`,
                phone,
                Otp,
            })
        } catch (error) {
            console.log(error)
            res.status(500).json({
                message: "Failed to send OTP"
            })
        }
    }

    async verifyOtp(req, res) {
        const { phone, otp, hash } = req.body;

        if (!phone || !otp || !hash) {
            res.status(400).json({ message: "Fields cannot be empty" })
        }

        const [hashOtp, exptime] = hash.split('.')

        if (Date.now() > +exptime) {
            res.status(400).json({
                message: "OTP expired!"
            })
        }

        const verifyData = `${phone}.${otp}.${exptime}`

        const isValid = otpService.verifyOtp(verifyData, hashOtp)

        if (!isValid) {
            res.status(400).json({
                message: "Invalid OTP!"
            })
        }

        let user;

        try {
            user = await UserService.findUser({ phone })
            if (!user) {
                user = await UserService.createUser({ phone })
            }
        } catch (error) {
            console.log(error)
            res.status(500).json({ message: "db error" })
        }

        const { accessToken, refreshToken } = TokenService.generateToken({ _id: user._id, activated: false })

        await TokenService.storeToken(user._id, refreshToken)

        res.cookie('refreshToken', refreshToken, {
            maxAge: 1000 * 60 * 60 * 24 * 30,
            httpOnly: true,
        })

        res.cookie('accessToken', accessToken, {
            maxAge: 1000 * 60 * 60 * 24 * 30,
            httpOnly: true,
        })

        const UserDto = new userDto(user)
        res.json({ user: UserDto })
    }

    async activateUser(req, res) {

        const { fullName, avatar } = req.body;

        if (!fullName) {
            res.status(400).json({ message: "All fields are required" })
        }
        if (avatar) {
            const buffer = Buffer.from(avatar?.replace(/^data:image\/(png|jpeg|jpg);base64,/, ''), 'base64')

            const imagePath = `${Date.now()}-${Math.round(
                Math.random() * 1e9
            )}.png`;

            const jimResp = await Jimp.read(buffer);
            jimResp
                .resize(150, Jimp.AUTO)
                .write(path.resolve(__dirname, `../userImages/${imagePath}`));
        }

        const userId = req.user._id;

        try {

            const user = await UserService.findUser({ _id: userId });
            if (!user) {
                res.status(404).json({ message: 'User not found!' });
            }
            user.activated = true;
            user.name = fullName;
            user.avatar ? user.avatar = `/userImages/${imagePath}` : "";
            user.save();
            res.json({ user: new userDto(user), auth: true });
        } catch (err) {
            res.status(500).json({ message: 'Something went wrong!' });
        }
    }

    async refresh(req, res) {

        // get refresh token from cookie
        const { refreshToken: refreshTokenFromCookie } = req.cookies;

        // check if token is valid
        let userData;
        try {
            userData = await TokenService.verifyRefreshToken(
                refreshTokenFromCookie
            );
        } catch (err) {
            return res.status(401).json({ message: 'Invalid Token' });
        }

        // Check if token is in db
        try {
            const token = await TokenService.findRefreshToken(
                userData._id,
                refreshTokenFromCookie
            );
            if (!token) {
                return res.status(401).json({ message: 'Invalid token' });
            }
        } catch (err) {
            return res.status(500).json({ message: 'Internal error' });
        }

        // check if valid user
        const user = await UserService.findUser({ _id: userData._id });
        if (!user) {
            return res.status(404).json({ message: 'No user' });
        }

        // Generate new tokens
        const { refreshToken, accessToken } = TokenService.generateToken({
            _id: userData._id,
        });

        // Update refresh token
        try {
            await TokenService.updateRefreshToken(userData._id, refreshToken);
        } catch (err) {
            return res.status(500).json({ message: 'Internal error' });
        }

        // put in cookie
        res.cookie('refreshToken', refreshToken, {
            maxAge: 1000 * 60 * 60 * 24 * 30,
            httpOnly: true,
        });

        res.cookie('accessToken', accessToken, {
            maxAge: 1000 * 60 * 60 * 24 * 30,
            httpOnly: true,
        });

        // response
        res.json({ user: new userDto(user), auth: true });
    }

    async logout(req, res) {
        const { refreshToken } = req.cookies;
        // delete refresh token from db
        await TokenService.removeToken(refreshToken);
        // delete cookies
        res.clearCookie('refreshToken');
        res.clearCookie('accessToken');
        res.json({ user: null, auth: false });
    }

    async getUser(req, res) {

        try {
            const user = await UserService.findUserId(req.params.userId)
            res.json(user)
        } catch (error) {
            res.status(500).json({ message: "db error" })
        }
    }

    async getUserByData(req, res) {

        const phone = req.query.phone;

        if (!phone) {
            res.status(400).json({ message: "Please enter a phone number" })
        }

        try {
            const user = await UserService.findUser({ phone })
            res.json(user)
        } catch (error) {
            res.status(500).json({ message: "db error" })
        }
    }

}

module.exports = new AuthController();