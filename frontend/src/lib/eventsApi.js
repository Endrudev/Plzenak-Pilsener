// Vrací { items, total, page, perPage } — GET /api/events je server-side
// stránkované. Volající, co nepošlou page/perPage, dostanou velkorysou
// první stránku (backend výchozí perPage=100), ne skutečně neomezený dotaz.
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

// --- Fronta návrhů akcí (GET/POST /api/candidates), jen pro přihlášeného administrátora ---

// Odpověď nemusí být JSON (proxy před backendem vrací při chybě HTML nebo prázdné tělo),
// a `response.json()` by pak selhalo nesrozumitelným "Unexpected end of JSON input".
// Tady se chyba vždycky přeloží do věty, kterou lze ukázat uživateli.
async function candidatesRequest(path, options = {}){
    const response = await fetch(`${import.meta.env.VITE_API_URL}/api/candidates${path}`, {
        ...options,
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            ...(options.body ? {'Content-Type': 'application/json'} : {}),
        },
    })
    let data = null
    try{
        data = await response.json()
    }catch{
        data = null
    }
    if (!response.ok){
        throw new Error(data?.error || `Server vrátil chybu ${response.status}.`)
    }
    return data
}

export async function getCandidates(status = 'pending'){
    return candidatesRequest(`?status=${encodeURIComponent(status)}`)
}

// ids: pole id návrhů (1 až 50). Vrací { results: [{ ok, id, eventId, imageSaved, imageError } | { ok: false, id, error }] }
export async function approveCandidates(ids){
    return candidatesRequest('/approve', {method: 'POST', body: JSON.stringify({ids})})
}

export async function rejectCandidate(id){
    return candidatesRequest(`/${id}/reject`, {method: 'POST'})
}
