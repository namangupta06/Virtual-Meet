import { createSlice } from '@reduxjs/toolkit'

const initialState = {
    fullName: "",
    avatar: "",
}

export const detailsSlice = createSlice({
    name: 'details',
    initialState,
    reducers: {

        setFullName: (state, action) => {
            state.fullName = action.payload;
        },

        setAvatar: (state, action) => {
            state.avatar = action.payload;
        }
    },
})


export const { setFullName, setAvatar } = detailsSlice.actions

export default detailsSlice.reducer