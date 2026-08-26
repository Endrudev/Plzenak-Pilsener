import { useState, useRef, useEffect, useId } from 'react'
import './FilterSelect.css'

// Vlastní dropdown místo nativního <select> — kvůli vzhledu podle design systému
// (popover se --shadow-pop, vybraná položka na cream pozadí) a kvůli šipce,
// která u nativního selectu nešla spolehlivě udržet u pravého okraje.
//
// Řízená komponenta: hodnotu drží rodič a předává ji v `value`, změnu ohlásí `onChange`.
// Vlastní stav si komponenta drží jen na to, jestli je popover otevřený a která
// položka je "nasvícená" klávesnicí.
//
// Props:
//   icon        — JSX ikona vlevo v tlačítku (nepovinné)
//   placeholder — text, když není nic vybráno (zároveň popisek pro čtečku)
//   value       — aktuálně vybraná hodnota ('' = nic)
//   onChange    — dostane novou hodnotu
//   options     — [{ value, label, icon? }]
//   clearable   — když true, první položka v seznamu výběr zruší
export default function FilterSelect({
    icon = null,
    placeholder,
    value = '',
    onChange,
    options = [],
    clearable = true,
}) {
    const [open, setOpen] = useState(false)
    const [activeIndex, setActiveIndex] = useState(-1)

    const rootRef = useRef(null)
    const triggerRef = useRef(null)
    const listRef = useRef(null)
    const listId = useId()

    // Seznam, přes který se prochází klávesnicí — s volitelnou položkou na zrušení výběru
    const items = clearable
        ? [{ value: '', label: placeholder }, ...options]
        : options

    const selected = options.find(o => o.value === value)

    // Když má ikonu aspoň jedna položka, vyhradí se místo i těm bez ikony —
    // jinak by se text v seznamu nezarovnal (typicky u položky rušící výběr).
    const hasIcons = options.some(o => o.icon)

    // Zavření při kliknutí mimo komponentu
    useEffect(() => {
        if (!open) return
        function onOutside(e) {
            if (rootRef.current && !rootRef.current.contains(e.target)) {
                setOpen(false)
            }
        }
        document.addEventListener('mousedown', onOutside)
        return () => document.removeEventListener('mousedown', onOutside)
    }, [open])

    // Po otevření nasvítit aktuálně vybranou položku (nebo první)
    useEffect(() => {
        if (!open) {
            setActiveIndex(-1)
            return
        }
        const index = items.findIndex(i => i.value === value)
        setActiveIndex(index >= 0 ? index : 0)
    }, [open])

    // Držet nasvícenou položku ve viditelné části seznamu
    useEffect(() => {
        if (!open || activeIndex < 0 || !listRef.current) return
        const node = listRef.current.children[activeIndex]
        if (node) node.scrollIntoView({ block: 'nearest' })
    }, [activeIndex, open])

    function choose(newValue) {
        onChange?.(newValue)
        setOpen(false)
        triggerRef.current?.focus()
    }

    function onKeyDown(e) {
        if (e.key === 'Escape') {
            if (open) {
                e.preventDefault()
                setOpen(false)
                triggerRef.current?.focus()
            }
            return
        }
        if (e.key === 'Tab') {
            setOpen(false)
            return
        }
        if (!open) {
            if (e.key === 'ArrowDown' || e.key === 'ArrowUp' || e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                setOpen(true)
            }
            return
        }
        if (e.key === 'ArrowDown') {
            e.preventDefault()
            setActiveIndex(i => (i + 1) % items.length)
        } else if (e.key === 'ArrowUp') {
            e.preventDefault()
            setActiveIndex(i => (i - 1 + items.length) % items.length)
        } else if (e.key === 'Home') {
            e.preventDefault()
            setActiveIndex(0)
        } else if (e.key === 'End') {
            e.preventDefault()
            setActiveIndex(items.length - 1)
        } else if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            if (items[activeIndex]) choose(items[activeIndex].value)
        }
    }

    return (
        <div
            ref={rootRef}
            className={`filter-dropdown${open ? ' filter-dropdown--open' : ''}`}
            onKeyDown={onKeyDown}
        >
            <button
                ref={triggerRef}
                type="button"
                className="filter-dropdown-trigger"
                aria-haspopup="listbox"
                aria-expanded={open}
                aria-label={placeholder}
                aria-controls={open ? listId : undefined}
                aria-activedescendant={open && activeIndex >= 0 ? `${listId}-${activeIndex}` : undefined}
                onClick={() => setOpen(o => !o)}
            >
                {icon && <span className="filter-dropdown-icon" aria-hidden="true">{icon}</span>}
                <span className={`filter-dropdown-label${selected ? '' : ' filter-dropdown-label--placeholder'}`}>
                    {selected ? selected.label : placeholder}
                </span>
                <svg
                    className="filter-dropdown-chevron"
                    width="13" height="13" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                    aria-hidden="true"
                >
                    <polyline points="6 9 12 15 18 9" />
                </svg>
            </button>

            {open && (
                <ul
                    ref={listRef}
                    id={listId}
                    className="filter-dropdown-popover"
                    role="listbox"
                    aria-label={placeholder}
                >
                    {items.map((item, index) => {
                        const isSelected = item.value === value
                        const isActive = index === activeIndex
                        return (
                            <li
                                key={item.value || '__clear'}
                                id={`${listId}-${index}`}
                                role="option"
                                aria-selected={isSelected}
                                className={
                                    'filter-dropdown-option'
                                    + (isSelected ? ' filter-dropdown-option--selected' : '')
                                    + (isActive ? ' filter-dropdown-option--active' : '')
                                }
                                onMouseEnter={() => setActiveIndex(index)}
                                onClick={() => choose(item.value)}
                            >
                                {hasIcons && (
                                    <span className="filter-dropdown-option-icon" aria-hidden="true">
                                        {item.icon ?? null}
                                    </span>
                                )}
                                <span className="filter-dropdown-option-label">{item.label}</span>
                                {isSelected && (
                                    <svg
                                        className="filter-dropdown-check"
                                        width="14" height="14" viewBox="0 0 24 24" fill="none"
                                        stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"
                                        aria-hidden="true"
                                    >
                                        <polyline points="20 6 9 17 4 12" />
                                    </svg>
                                )}
                            </li>
                        )
                    })}
                </ul>
            )}
        </div>
    )
}
