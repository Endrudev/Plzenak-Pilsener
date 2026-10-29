// Návrat na přehled akcí ve stavu, ve kterém ho admin opustil (hledání, období,
// kategorie, stránka). Přehled drží filtry v URL a poslední adresu si zapíše sem.
// Formulář po uložení a tlačítka „zpět“ se pak vrací na ni, ne na holý /admin/dashboard.
// sessionStorage: platí do zavření karty, nic se neukládá natrvalo.

const KEY = 'plzenak-admin-dashboard'
const BASE = '/admin/dashboard'

export function rememberDashboard(search) {
    try {
        sessionStorage.setItem(KEY, search)
    } catch {
        // bez úložiště se jen vrací na výchozí přehled
    }
}

export function dashboardPath() {
    try {
        const search = sessionStorage.getItem(KEY)
        return search && search.startsWith('?') ? BASE + search : BASE
    } catch {
        return BASE
    }
}
