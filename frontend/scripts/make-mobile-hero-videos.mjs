// Mobilní verze hero videí stránek kategorií (2026-10-20).
//
// Na telefonu na výšku (do 540 px šířky) je pás hero 460 px vysoký a video
// ho vyplní ořezem (object-fit: cover): roztáhne se na výšku a boky se
// uříznou. Z videa 2880 × 1500 je tak vidět jen asi polovina šířky. Mobilní
// verze obsahuje jen tu část, která se může ukázat, v nižším rozlišení
// a se stejnými 60 snímky za sekundu.
//
// Proč se záběr nezmění: výřez má plnou výšku originálu a poměr ASPECT, který
// je širší než nejširší viditelná plocha na mobilu (změřeno: 1,174 při 540 px,
// pás 460 px; stránka Akce má pás vyšší, poměr nejvýš 0,75). Cover proto vždy
// škáluje podle výšky a ořezává jen do stran, stejně jako u originálu. Výřez
// začíná na x0 = pos × (W − w), kde pos je vodorovná část object-position
// stránky (město 50 %, Hudba na mobilu 85 %). Pak telefon v jakékoli šířce do
// 540 px uvidí přesně stejné pixely jako z originálu (odvození v Deníku
// 2026-10-20). Když se změní object-position nebo výška pásu na mobilu, musí se
// video vyrobit znovu.
//
// Vstupem jsou hotová desktopová videa (scripts/render-hero-videos.mjs), výstup
// jde vedle nich jako <jméno>-mobile.mp4. Potřebuje ffmpeg a ffprobe v PATH.
//
//   node scripts/make-mobile-hero-videos.mjs

import { execFileSync } from 'node:child_process'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const DIR = path.join(path.dirname(fileURLToPath(import.meta.url)), '../src/components/scenes/videos')

const ASPECT = 1.25   // šířka / výška výřezu, rezerva nad změřenými 1,174
const OUT_H = 1200    // výška výstupu: pás 460 px je ostrý do hustoty displeje 2,6

// crf: o něco vyšší komprese než u desktopové verze (20 a 23). Na malém displeji
// rozdíl není vidět (porovnáno na snímcích 2026-10-20) a koncert má hodně pohybu
// (dav, konfety, světla), který se komprimuje hůř.
const JOBS = [
    { name: 'city-hero', pos: 0.5, crf: 23 },      // TOP akce, Akce, Dnes, Tento víkend: '50% 100%'
    { name: 'concert-hero', pos: 0.85, crf: 27 },  // Hudba na mobilu: '85% 50%'
]

const even = n => Math.round(n / 2) * 2

for (const job of JOBS) {
    const src = path.join(DIR, `${job.name}.mp4`)
    const [W, H] = execFileSync('ffprobe', ['-v', 'error', '-select_streams', 'v:0', '-show_entries', 'stream=width,height', '-of', 'csv=p=0', src])
        .toString().trim().split(',').map(Number)
    const cropW = even(ASPECT * H)
    const x0 = even(job.pos * (W - cropW))
    const outW = even(ASPECT * OUT_H)
    const out = path.join(DIR, `${job.name}-mobile.mp4`)
    execFileSync('ffmpeg', [
        '-y', '-i', src,
        '-vf', `crop=${cropW}:${H}:${x0}:0,scale=${outW}:${OUT_H}:flags=lanczos`,
        '-an', '-c:v', 'libx264', '-preset', 'slow', '-tune', 'animation', '-crf', String(job.crf),
        '-pix_fmt', 'yuv420p', '-movflags', '+faststart', out,
    ], { stdio: 'ignore' })
    console.log(`${job.name}: ${W}×${H} → výřez ${cropW}×${H} od x=${x0} → ${outW}×${OUT_H}`)
}
