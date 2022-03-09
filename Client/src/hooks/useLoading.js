import { useState, useEffect } from 'react'
import axios from "axios"
import { useDispatch } from "react-redux"
import { setAuth } from "../Store/AuthSlice"

export const useLoading = () => {

    const [loading, setLoading] = useState(true);
    const dispatch = useDispatch();
    useEffect(() => {
        (async () => {
            try {
                const { data } = await axios.get(
                    `http://localhost:5000/api/refresh`,
                    {
                        withCredentials: true,
                    }
                );
                dispatch(setAuth(data));
                setLoading(false);
            } catch (err) {
                console.log(err);
                setLoading(false);
            }
        })();
    });

    return { loading };

}
