// Stáhne textový obsah jako soubor v prohlížeči — obecná pomůcka (ne jen
// pro .ics), postavená na dočasném Blob URL a programově kliknutém <a>.
// Vedlejší efekt (DOM/URL API), proto se netestuje jednotkovým testem —
// obsah, co se má stáhnout, staví čisté funkce jako buildIcsFile.js.
export function downloadTextFile(filename, content, mimeType = 'text/plain') {
    const blob = new Blob([content], { type: mimeType })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
}
