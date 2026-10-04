import './EventCardSkeleton.css'

// Zástupné karty při načítání seznamu akcí. Mají stejné rozměry bloků jako
// EventCard (obrázek, název, dva řádky meta, štítek, tlačítko), takže se po
// načtení obsah nepřeskládá. Jediná běžící smyčka je shimmer (.skeleton v
// index.css); pulz „Dnes" tu neběží, protože žádná karta ještě není.
export default function EventCardSkeleton({ count = 6 }) {
    return (
        <>
            <span className="event-skel-status" role="status">Načítání akcí…</span>
            {Array.from({ length: count }, (_, i) => (
                <div key={i} className="event-card event-skel" aria-hidden="true">
                    <div className="event-skel-image skeleton" />
                    <div className="event-skel-info">
                        <div className="event-skel-line event-skel-line--title skeleton" />
                        <div className="event-skel-line event-skel-line--meta skeleton" />
                        <div className="event-skel-line event-skel-line--meta-short skeleton" />
                        <div className="event-skel-line event-skel-line--tag skeleton" />
                        <div className="event-skel-line event-skel-line--btn skeleton" />
                    </div>
                </div>
            ))}
        </>
    )
}
