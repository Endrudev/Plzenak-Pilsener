import './EventDetailSkeleton.css'

// Zástupná kostra detailu akce: hero, nadpis a pár řádků, vedle karta se
// vstupenkou. Rozměry kopírují #detail-hero a #detail-main, takže se po
// načtení stránka nepřeskládá.
export default function EventDetailSkeleton() {
    return (
        <div id="detail-skel" role="status" aria-label="Načítání akce">
            <div className="detail-skel-hero skeleton" />
            <div className="detail-skel-body">
                <div className="detail-skel-main">
                    <div className="detail-skel-line detail-skel-line--h skeleton" />
                    <div className="detail-skel-line skeleton" />
                    <div className="detail-skel-line skeleton" />
                    <div className="detail-skel-line detail-skel-line--short skeleton" />
                </div>
                <div className="detail-skel-card skeleton" />
            </div>
        </div>
    )
}
