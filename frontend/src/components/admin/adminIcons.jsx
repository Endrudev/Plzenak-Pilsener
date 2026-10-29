// Ikony administrace. Jedna sada se stejnou kresbou (mřížka 24, tah 2, kulaté konce),
// dřív měla každá stránka svoje inline SVG s tahem od 1,8 do 2,8. Všechny jsou
// dekorativní (aria-hidden), význam nese text tlačítka nebo jeho aria-label.

function Icon({ size = 18, children, strokeWidth = 2 }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            {children}
        </svg>
    )
}

export const PlusIcon = p => <Icon {...p} strokeWidth={2.4}><path d="M12 5v14M5 12h14" /></Icon>
export const SearchIcon = p => <Icon {...p}><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></Icon>
export const EyeIcon = p => <Icon {...p}><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z" /><circle cx="12" cy="12" r="3" /></Icon>
export const EyeOffIcon = p => <Icon {...p}><path d="M10.6 5.1A10.4 10.4 0 0 1 12 5c6.4 0 10 7 10 7a17 17 0 0 1-2.6 3.4M6.6 6.6C3.8 8.4 2 12 2 12s3.6 7 10 7a9.6 9.6 0 0 0 5.4-1.6" /><path d="M9.9 9.9a3 3 0 0 0 4.2 4.2M3 3l18 18" /></Icon>
export const PencilIcon = p => <Icon {...p}><path d="M4 20h4L19 9a2.8 2.8 0 0 0-4-4L4 16v4z" /><path d="m13.5 6.5 4 4" /></Icon>
export const TrashIcon = p => <Icon {...p}><path d="M4 7h16M10 11v6M14 11v6M6 7l1 12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-12M9 7V4h6v3" /></Icon>
export const LogOutIcon = p => <Icon {...p}><path d="M14 4h4a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-4M10 16l-4-4 4-4M6 12h10" /></Icon>
export const SunIcon = p => <Icon {...p}><circle cx="12" cy="12" r="4" /><path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6 7 7M17 17l1.4 1.4M5.6 18.4 7 17M17 7l1.4-1.4" /></Icon>
export const MoonIcon = p => <Icon {...p}><path d="M20 14.5A8.5 8.5 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5z" /></Icon>
export const CalendarIcon = p => <Icon {...p}><rect x="3" y="5" width="18" height="16" rx="3" /><path d="M3 10h18M8 3v4M16 3v4" /></Icon>
export const PinIcon = p => <Icon {...p}><path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21z" /><circle cx="12" cy="9.5" r="2.5" /></Icon>
export const LinkIcon = p => <Icon {...p}><path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1" /><path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1" /></Icon>
export const ImageIcon = p => <Icon {...p}><rect x="3" y="4" width="18" height="16" rx="3" /><circle cx="9" cy="10" r="2" /><path d="m21 16-5-5-9 9" /></Icon>
export const CheckIcon = p => <Icon {...p} strokeWidth={2.4}><path d="m5 12.5 4.5 4.5L19 7.5" /></Icon>
export const CloseIcon = p => <Icon {...p}><path d="M6 6l12 12M18 6 6 18" /></Icon>
export const StarIcon = p => <Icon {...p}><path d="m12 4 2.5 5.1 5.6.8-4 4 .9 5.6-5-2.7-5 2.7.9-5.6-4-4 5.6-.8z" /></Icon>
export const InboxIcon = p => <Icon {...p}><path d="M3 13h5l1.5 3h5l1.5-3h5" /><path d="M5.5 5h13L21 13v5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-5z" /></Icon>
export const ListIcon = p => <Icon {...p}><path d="M9 6h11M9 12h11M9 18h11M4 6h.01M4 12h.01M4 18h.01" /></Icon>
export const ExternalIcon = p => <Icon {...p}><path d="M14 4h6v6M20 4l-9 9M18 14v4a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4" /></Icon>
export const RefreshIcon = p => <Icon {...p}><path d="M20 12a8 8 0 1 1-2.4-5.7M20 4v5h-5" /></Icon>
export const ChevronLeftIcon = p => <Icon {...p}><path d="m15 18-6-6 6-6" /></Icon>
export const ChevronRightIcon = p => <Icon {...p}><path d="m9 18 6-6-6-6" /></Icon>
export const ChevronDownIcon = p => <Icon {...p}><path d="m6 9 6 6 6-6" /></Icon>
export const AlertIcon = p => <Icon {...p}><circle cx="12" cy="12" r="9" /><path d="M12 7.5v5M12 16.5h.01" /></Icon>
export const MailIcon = p => <Icon {...p}><rect x="3" y="5" width="18" height="14" rx="3" /><path d="m4 7 8 6 8-6" /></Icon>
export const LockIcon = p => <Icon {...p}><rect x="4" y="10.5" width="16" height="10.5" rx="3" /><path d="M8 10.5V7a4 4 0 0 1 8 0v3.5" /></Icon>
export const MenuIcon = p => <Icon {...p}><path d="M4 8h16M4 16h16" /></Icon>
