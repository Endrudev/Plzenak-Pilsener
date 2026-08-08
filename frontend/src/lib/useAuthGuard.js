import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export function useAuthGuard(){
    const navigate = useNavigate()
    useEffect(() => {
        const token = localStorage.getItem('token')
        if(!token) {
            navigate('/admin')
        }else{
            let payload = null
            try{
                const parts = token.split('.')
                const decoded = atob(parts[1])
                payload = JSON.parse(decoded)
            }catch(err){
                navigate('/admin')
                localStorage.removeItem('token')
                return
            }
            if(payload.exp < (Date.now()/1000)){
                navigate('/admin')
                localStorage.removeItem('token')
            }
        }
    }, [])
}