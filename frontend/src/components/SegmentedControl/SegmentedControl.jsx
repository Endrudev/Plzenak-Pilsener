import './SegmentedControl.css'

// options: [{ value, label }]
export default function SegmentedControl({ options, value, onChange, ariaLabel }) {
    return (
        <div className="segmented" role="group" aria-label={ariaLabel}>
            {options.map(opt => (
                <button
                    key={opt.value}
                    type="button"
                    className={`segmented-btn${opt.value === value ? ' segmented-btn--active' : ''}`}
                    aria-pressed={opt.value === value}
                    onClick={() => onChange(opt.value)}
                >
                    {opt.label}
                </button>
            ))}
        </div>
    )
}
