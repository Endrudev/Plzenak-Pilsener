// Skloňování počtu akcí — handoff edge case: 1 akce, 2–4 akce, 5+ akcí.
// Intl.PluralRules('cs') dává přesně tyhle tři kategorie (+ 'many' pro
// desetinná čísla, která tu nenastanou): one=1, few=2–4, other=0 a 5+.
const RULES = new Intl.PluralRules('cs')
const FORMS = { one: 'akce', few: 'akce', many: 'akcí', other: 'akcí' }

export function eventCountLabel(count) {
    return `${count} ${FORMS[RULES.select(count)] ?? 'akcí'}`
}
