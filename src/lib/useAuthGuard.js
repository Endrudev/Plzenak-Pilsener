import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from './supabase.js'

export function useAuthGuard() {
    const navigate = useNavigate()
    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (!session) navigate('/admin')
        })
    }, [])
}
