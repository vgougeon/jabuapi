import { Loader } from "@mantine/core";
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { AlertCircle, Check, RoadSign } from "tabler-icons-react";

export default function useApiLoader(size = 24, color = "white") {
    const [isLoading, setIsLoading] = useState(false);
    const [isError, setIsError] = useState(false);
    const [error, setError] = useState('')
    const [state, setState] = useState(null)

    const request = async (axiosRequest) => {
        setIsLoading(true)
        setState(<Loader size={size} color={color} />)
        try {
            const result = await axiosRequest
            setIsLoading(false)
            setState(<Check size={size} color={color} />)
            setTimeout(() => {
                setState(null)
            }, 1500)
            return result
        }
        catch (err) {
            setIsError(true)
            console.log(err.response.data)
            setError(err.response.data)
            setState(<AlertCircle size={size} color={color} />)
            setTimeout(() => {
                setState(null)
            }, 2000)
            setIsLoading(false)
            return err
        }
    }
    return { isLoading, isError, request, state };
}

export function ApiLoaderState({ request, className, children }) {
    return (
        <AnimatePresence exitBeforeEnter>
            { request.state !== null && <motion.div key={request.state} className="overflow-hidden" initial={{ width: 0, opacity: 0 }}
                animate={{ width: 'auto', opacity: 1 }} exit={{ width: 0, opacity: 0 }}>
                <div className={className}>{request.state}</div>
            </motion.div> }
        </AnimatePresence>
    )
}