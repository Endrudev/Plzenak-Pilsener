import './EventDetailSkeleton.css'

// Zástupná kostra detailu akce: tmavý hero se zaoblenými rohy, pod ním obsah a
// vpravo karta se vstupenkou. Rozměry kopírují .ed-hero, .ed-main a .ed-aside
// (EventDetail.css), takže se po načtení stránka nepřeskládá.
export default function EventDetailSkeleton() {
    return (
        <div id="detail-skel" className="lp" role="status" aria-label="Načítání akce">
            <div className="eds-hero" />
            <div className="lp-sheet">
            <div className="lp-wrap eds-body">
                <div className="eds-card skeleton" />
                <div className="eds-main">
                    <div className="eds-line eds-line--h skeleton" />
                    <div className="eds-line skeleton" />
                    <div className="eds-line skeleton" />
                    <div className="eds-line eds-line--short skeleton" />
                </div>
            </div>
            </div>
        </div>
    )
}
