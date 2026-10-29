import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { uploadEventImage, getEventById, updateEvent, deleteEvent } from '../../lib/eventsApi.js'
import { useAuthGuard } from '../../lib/useAuthGuard.js'
import { splitTags } from '../../lib/events/eventTags.js'
import { parseCzechDate } from '../../lib/events/eventBadge.js'
import { eventPath } from '../../lib/events/eventPath.js'
import { dashboardPath } from '../../lib/admin/dashboardReturn.js'
import AdminShell from '../../components/admin/AdminShell/AdminShell.jsx'
import AdminDialog from '../../components/admin/AdminDialog/AdminDialog.jsx'
import EventForm, { emptyEvent } from '../../components/admin/EventForm/EventForm.jsx'
import { AlertIcon } from '../../components/admin/adminIcons.jsx'
import './AdminEdit.css'

// Úprava akce. Načte akci, převede ji na počáteční hodnoty formuláře (opačné
// transformace k těm při ukládání) a řeší uložení a smazání. Formulář je společný
// s vytvořením (components/admin/EventForm).
function toFormValues(event) {
    // Sloupce v databázi jsou nullable, ale řízený <input> nesmí dostat
    // null ani undefined — React by ho přepnul na neřízený a od té chvíle
    // by ignoroval value. Proto se všechno textové sráží na prázdný řetězec.
    const parts = splitTags(event.tags)
    return {
        ...emptyEvent(),
        title: event.name ?? '',
        // Nečitelné datum nechá výchozí dnešek, `null.split()` by shodilo celé načtení.
        date: parseCzechDate(event.date) ?? new Date(),
        category: parts.category,
        // Vedlejší štítky (druhá kategorie) formulář nezobrazuje, ale při uložení je vrací zpět,
        // aby je úprava akce nezahodila. TOP akce je zvlášť přepínač.
        extraTags: parts.extra,
        top: parts.top,
        description: event.description?.join('\n') ?? '',
        locationName: event.location ?? '',
        mapSrc: event.mapSrc ?? '',
        url: event.url ?? '',
        imageUrl: event.imageUrl ?? null,
    }
}

export default function AdminEdit() {
    useAuthGuard()
    const { id } = useParams()
    const navigate = useNavigate()
    const [event, setEvent] = useState(null)
    const [loadError, setLoadError] = useState(null)
    const [confirmOpen, setConfirmOpen] = useState(false)
    const [deleting, setDeleting] = useState(false)
    const [deleteError, setDeleteError] = useState(null)

    useEffect(() => {
        let cancelled = false
        setEvent(null)
        setLoadError(null)
        getEventById(id)
            .then(data => { if (!cancelled) setEvent(data) })
            .catch(e => {
                // Bez tohohle skončila chyba jako unhandled rejection v konzoli a
                // admin viděl prázdný formulář, který vypadal jako nová akce —
                // uložení by pak přepsalo existující akci prázdnými hodnotami.
                console.error(e)
                if (!cancelled) setLoadError(e.message)
            })
        return () => { cancelled = true }
    }, [id])

    async function handleSubmit({ payload, imageFile }) {
        // Selhání nahrání obrázku akci NEMAŽE (na rozdíl od vytvoření): je to existující
        // akce a uložené texty platí. Chybu ukáže formulář a obrázek jde nahrát znovu.
        const updated = await updateEvent(id, payload)
        if (imageFile !== null) {
            await uploadEventImage(updated.id, imageFile)
        }
        navigate(dashboardPath(), { state: { notice: { type: 'ok', text: `Uloženo: ${payload.name}` } } })
    }

    // Mazání je nevratné (backend smaže řádek i objekt v R2), proto dialog se jménem akce.
    async function confirmDelete() {
        setDeleting(true)
        setDeleteError(null)
        try {
            await deleteEvent(id)
            navigate(dashboardPath(), { state: { notice: { type: 'ok', text: `Smazáno: ${event.name}` } } })
        } catch (e) {
            setDeleteError(e.message)
            setDeleting(false)
        }
        // Při úspěchu se setDeleting nevolá — komponenta je po navigaci odmountovaná.
    }

    // Když se akce nenačte, formulář se nevykreslí vůbec. Prázdná pole by totiž
    // vypadala jako rozpracovaná akce a uložení by přepsalo data v databázi.
    if (loadError) {
        return (
            <AdminShell>
                <div className="adm-panel adm-empty adm-empty--error">
                    <span className="adm-empty-ic"><AlertIcon size={24} /></span>
                    <h1 className="ae-error-title">Akci se nepodařilo načíst</h1>
                    <p>{loadError}</p>
                    <Link to={dashboardPath()} className="adm-btn adm-btn--primary">Zpět na přehled</Link>
                </div>
            </AdminShell>
        )
    }

    return (
        <AdminShell>
            {event === null ? (
                <div id="ae-loading" role="status" aria-label="Načítání akce">
                    <span className="adm-skel ae-skel-title" />
                    <div id="ae-skel-grid">
                        <span className="adm-skel ae-skel-panel" />
                        <span className="adm-skel ae-skel-preview" />
                    </div>
                </div>
            ) : (
                <EventForm
                    key={event.id}
                    mode="edit"
                    initial={toFormValues(event)}
                    viewHref={eventPath(event)}
                    onSubmit={handleSubmit}
                    onDelete={() => { setDeleteError(null); setConfirmOpen(true) }}
                />
            )}

            <AdminDialog
                open={confirmOpen}
                title={event ? `Smazat „${event.name}“?` : ''}
                confirmLabel={deleting ? 'Mažu…' : 'Smazat akci'}
                busy={deleting}
                onConfirm={confirmDelete}
                onClose={() => setConfirmOpen(false)}
            >
                <p>Akce zmizí z webu i s obrázkem. Vrátit to nejde.</p>
                {deleteError && <p className="adm-field-error" role="alert"><AlertIcon size={15} />{deleteError}</p>}
            </AdminDialog>
        </AdminShell>
    )
}
