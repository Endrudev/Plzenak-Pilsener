import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createEvent, uploadEventImage, deleteEvent } from '../../lib/eventsApi.js'
import { useAuthGuard } from '../../lib/useAuthGuard.js'
import { dashboardPath } from '../../lib/admin/dashboardReturn.js'
import AdminShell from '../../components/admin/AdminShell/AdminShell.jsx'
import EventForm, { emptyEvent } from '../../components/admin/EventForm/EventForm.jsx'

// Nová akce. Formulář je společný s úpravou (components/admin/EventForm), tady je jen
// to, co se stane při uložení: vytvořit akci, nahrát k ní obrázek a vrátit se na přehled.
export default function AdminCreate() {
    useAuthGuard()
    const navigate = useNavigate()
    const [initial] = useState(emptyEvent)

    async function handleSubmit({ payload, imageFile }) {
        let created = null
        try {
            created = await createEvent(payload)
            await uploadEventImage(created.id, imageFile)
        } catch (e) {
            // Akce bez obrázku by na webu visela s gradientem a admin by o ní nevěděl.
            // Když se vytvořila, ale obrázek selhal, smaže se a uložení jde zopakovat.
            if (created !== null) {
                try {
                    await deleteEvent(created.id)
                } catch (err) {
                    console.error(err.message)
                }
            }
            throw e
        }
        navigate(dashboardPath(), { state: { notice: { type: 'ok', text: `Vytvořeno: ${payload.name}` } } })
    }

    return (
        <AdminShell>
            <EventForm mode="create" initial={initial} onSubmit={handleSubmit} />
        </AdminShell>
    )
}
