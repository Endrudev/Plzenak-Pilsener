// Kdy se má stránka po změně adresy vrátit na začátek.
//
// Pouze při otevření nové stránky (PUSH, REPLACE) a jen když v adrese není
// kotva. Zpět a vpřed (POP) se nechávají na prohlížeči, který si pamatuje
// pozici, kde člověk byl. Kotva (#oddil) má vlastní cíl, na který se skáče.
// Změna dotazu (?q=...) se sem vůbec nedostane, protože komponenta sleduje
// jen pathname: hledání a filtry na /akce tak stránku nepřehodí nahoru.
export function shouldScrollToTop({ navigationType, hash }) {
    if (navigationType === 'POP') return false
    if (hash) return false
    return true
}
