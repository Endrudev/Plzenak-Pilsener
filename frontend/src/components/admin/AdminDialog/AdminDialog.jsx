import { useEffect, useRef } from 'react'
import { AlertIcon } from '../adminIcons.jsx'
import './AdminDialog.css'

// Potvrzení nevratné akce (smazat akci, zamítnout návrh). Nahrazuje window.confirm,
// který nejde nastylovat a na telefonu vypadá jako systémová chyba.
//
// Stojí na nativním <dialog> a showModal(): prohlížeč sám drží fokus uvnitř, Escape
// dialog zavře (událost `cancel`), stránka pod ním je inert a po zavření se fokus
// vrátí na prvek, který dialog otevřel. Výchozí fokus dostane bezpečné tlačítko
// Zrušit (autoFocus), ne potvrzení: Enter omylem nic nesmaže.
export default function AdminDialog({ open, title, children, confirmLabel, busy = false, onConfirm, onClose }) {
    const ref = useRef(null)

    useEffect(() => {
        const dialog = ref.current
        if (!dialog) return
        if (open && !dialog.open) dialog.showModal()
        if (!open && dialog.open) dialog.close()
    }, [open])

    function onCancel(e) {
        e.preventDefault()
        if (!busy) onClose()
    }

    // Klik na podklad (mimo kartu) zavře. Cíl je samotný <dialog>, protože karta ho
    // celý vyplňuje a podklad je jeho ::backdrop.
    function onClick(e) {
        if (e.target === ref.current && !busy) onClose()
    }

    return (
        <dialog ref={ref} className="adm-dialog" onCancel={onCancel} onClick={onClick} aria-labelledby="adm-dialog-title">
            {open && (
                <div className="adm-dialog-card">
                    <span className="adm-dialog-ic"><AlertIcon size={22} /></span>
                    <h2 id="adm-dialog-title">{title}</h2>
                    <div className="adm-dialog-body">{children}</div>
                    <div className="adm-dialog-actions">
                        <button type="button" className="adm-btn adm-btn--ghost" onClick={onClose} disabled={busy} autoFocus>
                            Zrušit
                        </button>
                        <button type="button" className="adm-btn adm-btn--solid-danger" onClick={onConfirm} disabled={busy}>
                            {confirmLabel}
                        </button>
                    </div>
                </div>
            )}
        </dialog>
    )
}
