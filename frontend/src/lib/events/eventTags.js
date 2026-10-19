// Štítky akce (sloupec `tags`) a jak se skládají z formuláře v administraci.
//
// Akce má v `tags` kategorii (Hudba, Kultura, ...) a případně příznak „TOP akce“. Dřív měl
// formulář jediný výběr, ve kterém byla i „TOP akce“, takže označení za TOP vzalo akci její
// kategorii a každé uložení zahodilo všechny štítky kromě jednoho. Importované akce přitom
// mají často víc štítků (třeba Kultura a Hudba).
//
// Pravidla:
//   - první štítek, který není TOP, je kategorie formuláře,
//   - ostatní štítky (vedlejší kategorie) se při úpravě zachovají,
//   - TOP akce je zvlášť zaškrtávátko a ukládá se vždy jako poslední štítek.

export const TOP_TAG = 'TOP akce'

// Z pole štítků vyrobí stav formuláře: { category, extra, top }.
// Akce, která má dnes jen „TOP akce“, dostane prázdnou kategorii (autor ji musí doplnit).
export function splitTags(tags) {
    const list = Array.isArray(tags) ? tags : []
    const top = list.includes(TOP_TAG)
    const rest = list.filter(tag => tag !== TOP_TAG)
    return { category: rest[0] ?? '', extra: rest.slice(1), top }
}

// Opačný směr: stav formuláře na pole štítků pro API. Vybraná kategorie je vždy první,
// duplicity a prázdné hodnoty se vyhodí.
export function joinTags({ category, extra = [], top = false }) {
    const tags = [category, ...extra].filter(Boolean)
    const unique = [...new Set(tags)].filter(tag => tag !== TOP_TAG)
    return top ? [...unique, TOP_TAG] : unique
}
