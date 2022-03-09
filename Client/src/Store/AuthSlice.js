import { createSlice } from '@reduxjs/toolkit'

const initialState = {
    isAuth: false,
    user: null,
    otp: {
        phone: "",
        hash: "",
    }
}

export const AuthSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {

        setAuth: (state, action) => {
            const { user } = action.payload;
            state.user = user;
            if (user === null) {
                state.isAuth = false;
            } else {
                state.isAuth = true;
            }
        },

        SendOtp: (state, action) => {
            const { phone, hash } = action.payload;
            state.otp.phone = phone;
            state.otp.hash = hash;
        }
    },
})


export const { setAuth, SendOtp } = AuthSlice.actions

export default AuthSlice.reducer