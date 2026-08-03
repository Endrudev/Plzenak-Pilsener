export async function getEvents(){
    const response = await fetch(`${import.meta.env.VITE_API_URL}/api/events`)
    const data = await response.json()
    if (!response.ok){
        throw new Error(data.error)
    }
    return data
}

export async function getEventById(id){
    const response = await fetch(`${import.meta.env.VITE_API_URL}/api/events/${id}`)
    const data = await response.json()
    if (!response.ok){
        throw new Error(data.error)
    }
    return data
}