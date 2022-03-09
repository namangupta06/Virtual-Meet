import { configureStore } from '@reduxjs/toolkit'
import user from "./AuthSlice"
import details from "./userDetails"

export const store = configureStore({
    reducer: {
        user,
        details,
    },
})