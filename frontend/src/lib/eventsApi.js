export async function getEvents(filter = {}){
    const params = new URLSearchParams()
    Object.entries(filter).forEach(([key, value]) => {
        if (value) params.set(key, value)
    })
    const queryString = params.toString()
    const response = await fetch(`${import.meta.env.VITE_API_URL}/api/events${queryString ? `?${queryString}` : ''}`)
    const data = await response.json()
    if (!response.ok){
        throw new Error(data.error)
    }
    return data
}

export async function getEventLocations(){
    const response = await fetch(`${import.meta.env.VITE_API_URL}/api/events/locations`)
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

export async function createEvent(event){
    const response = await fetch(`${import.meta.env.VITE_API_URL}/api/events`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(event), 
    })
    const data = await response.json()
    if (!response.ok){
        throw new Error(data.error)
    }
    return data
}

export async function updateEvent(id, event){
    const response = await fetch(`${import.meta.env.VITE_API_URL}/api/events/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(event),
    })
    const data = await response.json()
    if (!response.ok){
        throw new Error(data.error)
    }
    return data
}

export async function deleteEvent(id){
    const response = await fetch(`${import.meta.env.VITE_API_URL}/api/events/${id}`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
    })
    if (!response.ok){
        const data = await response.json()
        throw new Error(data.error)
    }
}

export async function uploadEventImage(id, image){
    const formData = new FormData()
    formData.append('image', image)
    const response = await fetch(`${import.meta.env.VITE_API_URL}/api/events/${id}/image`, {
        method: 'POST',
        headers: {
            'Authorization' : `Bearer ${localStorage.getItem('token')}`
        },
        body: formData,
    })
    const data = await response.json()
    if (!response.ok){
        throw new Error(data.error)
    }
    return data
}
