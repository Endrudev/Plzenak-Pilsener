import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { currentSession, signOut } from "./admin/session.js";

// Stránky administrace bez platného tokenu (chybí, nejde přečíst, vypršel) pošlou
// admina na přihlášení. Ověřuje jen tvar a `exp`, podpis kontroluje backend.
export function useAuthGuard(){
    const navigate = useNavigate()
    useEffect(() => {
        if (currentSession()) return
        signOut()
        navigate('/admin', { replace: true })
    }, [])
}
