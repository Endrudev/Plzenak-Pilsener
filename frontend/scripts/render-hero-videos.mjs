// Vyrenderuje smyčky pro velké hero dlaždice na homepage (TOP akce, Hudba) a pro hero stránek
// kategorií (/top-akce, /hudba) z živých scén. Dlaždice a hero mají jiný výřez, proto jsou to
// čtyři samostatná videa (city, concert, city-hero, concert-hero).
//
// PROČ: živé scény jsou tisíce SVG prvků a stovky CSS animací. I s pozastavením mimo myš
// stojí animace pod kurzorem hlavní vlákno (změřeno: TOP akce 17 fps, Hudba 50 fps).
// Video se dekóduje mimo hlavní vlákno a stojí skoro nic, proto se dlaždice přehrává z
// videa, které se při najetí spustí a po odjetí zastaví. Podrobnosti: vault, 02 Frontend/Hero scény.
//
// JAK: skript otevře běžící web, najede na dlaždici (tím se přimontuje živá scéna), schová
// všechno kromě scény a pak snímek po snímku nastavuje čas všem animacím (Web Animations
// API) a fotí. Aby se video dalo zacyklit bez skoku, každé nekonečné animaci se délka upraví na
// nejbližší podíl délky smyčky (např. 36 s ÷ 5 = 7,2 s místo 7 s). Rychlost animací se tím
// změní nanejvýš o pár desítek procent, smyčka je ale dokonale plynulá.
//
// Dlaždice a hero se běžně přehrávají z videa, proto skript otevírá adresu s ?hero-live, která
// vynutí živou scénu (viz HeroTile.jsx a CategoryHero.jsx). Hero se renderuje včetně ztmavení
// pod textem (shade), zatímco dlaždice mají ztmavení zvlášť nad videem.
//
// ONLY=city-hero,concert-hero omezí render na vybraná videa; poster (první snímek) se uloží
// do src/components/scenes/posters/<name>.webp.
//
// Spuštění (dev stack musí běžet na http://127.0.0.1/):
//   npm i --no-save playwright-core
//   PW_DIR=<složka s node_modules/playwright-core> node scripts/render-hero-videos.mjs
// Potřebuje nainstalovaný Chrome a ffmpeg v PATH. Výstup jde do src/components/scenes/videos/.
import { createRequire } from 'node:module'
import { mkdirSync, rmSync, statSync } from 'node:fs'
import { execFileSync } from 'node:child_process'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const require = createRequire((process.env.PW_DIR || process.cwd()) + '/')
const { chromium } = require('playwright-core')

const here = path.dirname(fileURLToPath(import.meta.url))
const OUT = path.resolve(here, '../src/components/scenes/videos')
const CHROME = process.env.CHROME || 'C:/Program Files/Google/Chrome/Application/chrome.exe'
const BASE = process.env.HERO_BASE || 'http://127.0.0.1'
const ONLY = process.env.ONLY ? process.env.ONLY.split(',') : null
const POSTERS = path.resolve(here, '../src/components/scenes/posters')
const SCALE = Number(process.env.SCALE || 1.5)
const TMP = process.env.FRAMES_DIR || path.join(process.env.TEMP || '.', 'hero-frames')

// loop: délka smyčky v sekundách; město má tramvaj s periodou 36 s, koncert se řídí tepem .5 s.
const JOBS = [
    { kind: 'tile', cls: 'top', name: 'city', loop: 36, fps: 60 },
    { kind: 'tile', cls: 'music', name: 'concert', loop: 24, fps: 60 },
    { kind: 'cat', page: '/top-akce', name: 'city-hero', loop: 36, fps: 60, crf: 29 },
    { kind: 'cat', page: '/hudba', name: 'concert-hero', loop: 24, fps: 60, crf: 29 },
]

const HIDE = `
.hero-tile-overlay, .hero-tile-arrow, .hero-tile-spot, .hero-poster, .hero-poster-shade,
.hero-tile::before, .hero-tile::after, .pz-scene .shade { display: none !important; }
.hero-tile, .hero-tile-scene { transform: none !important; transition: none !important; box-shadow: none !important; }
.hero-live { opacity: 1 !important; transition: none !important; }
.hero-tile { border-radius: 0 !important; }
/* Úvodní animace homepage (HeroBento.css) při renderu nesmí běžet. */
.is-intro .hero-tile, .is-intro .hero-poster, .is-intro .ht-w > span, .is-intro .hero-tile-arrow { animation: none !important; }
`

const HIDE_CAT = `
#site-header, .cat-hero-in, #cookie-banner { display: none !important; }
.cat-hero { margin-top: 0 !important; }
.cat-hero ~ *, footer { display: none !important; }
`

mkdirSync(OUT, { recursive: true })
const browser = await chromium.launch({ executablePath: CHROME, headless: true })

const QUICK = process.env.QUICK === '1'
for (const base of JOBS) {
    if (ONLY && !ONLY.includes(base.name)) continue
    const cat = base.kind === 'cat'
    const rootSel = cat ? '.cat-hero-scene' : `.hero-tile--${base.cls} .hero-live`
    const job = QUICK ? { ...base, loop: 4, fps: 12, name: base.name + '-test' } : base
    const frames = job.loop * job.fps
    const dir = path.join(TMP, job.name)
    rmSync(dir, { recursive: true, force: true })
    mkdirSync(dir, { recursive: true })

    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: SCALE })
    const page = await ctx.newPage()
    if (cat) {
        await page.goto(`${BASE}${job.page}?hero-live`)
        await page.waitForSelector('.cat-hero-scene .pz-scene', { timeout: 15000 })
        await page.evaluate(() => document.getElementById('cookie-banner')?.remove())
        await page.addStyleTag({ content: HIDE_CAT })
        await page.waitForTimeout(1500)
    } else {
        await page.goto(`${BASE}/?hero-live`)
        await page.waitForSelector(`.hero-tile--${job.cls}`)
        await page.evaluate(() => document.getElementById('cookie-banner')?.remove())
        await page.addStyleTag({ content: HIDE })
        await page.waitForTimeout(800)

        const tile = await page.$(`.hero-tile--${job.cls}`)
        const box = await tile.boundingBox()
        // Kurzor zůstane uprostřed dlaždice: tím je živá scéna přimontovaná a paralaxa je v neutrální poloze.
        await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2)
        await page.waitForSelector(`.hero-tile--${job.cls} .hero-live.is-ready`, { timeout: 15000 })
        await page.waitForTimeout(600)
    }

    const info = await page.evaluate(([loopMs, sel]) => {
        // Jen animace uvnitř živé scény (stránka má další, třeba scroll-driven u věty níž).
        const root = document.querySelector(sel)
        window.__sceneAnims = document.getAnimations().filter(a => a.timeline === document.timeline && a.effect?.target && root.contains(a.effect.target))
        let snapped = 0
        for (const a of window.__sceneAnims) {
            const t = a.effect.getTiming()
            if (Number.isFinite(t.iterations)) continue
            const alternate = String(t.direction).includes('alternate')
            const d = typeof t.duration === 'number' ? t.duration : a.effect.getComputedTiming().duration
            const period = alternate ? 2 * d : d
            if (!period || !Number.isFinite(period)) continue
            const n = Math.max(1, Math.round(loopMs / period))
            const k = (loopMs / n) / period
            a.effect.updateTiming({ duration: d * k, delay: (t.delay || 0) * k, endDelay: 0 })
            a.pause()
            snapped += 1
        }
        return { snapped, scene: window.__sceneAnims.length }
    }, [job.loop * 1000, rootSel])
    console.log(job.name, 'animace:', info)

    const live = await page.$(rootSel)
    const lb = await live.boundingBox()
    const clip = { x: lb.x, y: lb.y, width: lb.width, height: lb.height }
    // Posun času o deset smyček: všechny kladné prodlevy (tramvaj +2,8 s apod.) jsou pak uplynulé
    // a snímky jsou v ustáleném, periodickém stavu.
    const WARM = job.loop * 1000 * 10

    const t0 = Date.now()
    for (let f = 0; f < frames; f += 1) {
        const time = WARM + (f * 1000) / job.fps
        await page.evaluate((tm) => { for (const a of window.__sceneAnims) a.currentTime = tm }, time)
        await page.screenshot({
            path: path.join(dir, `f_${String(f).padStart(4, '0')}.jpg`),
            type: 'jpeg',
            quality: 93,
            clip,
            animations: 'allow',
        })
        if (f % 120 === 0) console.log(job.name, `snímek ${f}/${frames}`, `${((Date.now() - t0) / 1000).toFixed(0)} s`)
    }
    await ctx.close()

    const input = ['-y', '-framerate', String(job.fps), '-i', path.join(dir, 'f_%04d.jpg')]
    const vf = ['-vf', 'scale=trunc(iw/2)*2:trunc(ih/2)*2', '-an']
    execFileSync('ffmpeg', [...input, ...vf, '-c:v', 'libx264', '-preset', 'slow', '-crf', String(job.crf || 27), '-pix_fmt', 'yuv420p', '-movflags', '+faststart', path.join(OUT, `${job.name}.mp4`)], { stdio: 'ignore' })
    execFileSync('ffmpeg', [...input, ...vf, '-c:v', 'libvpx-vp9', '-crf', '36', '-b:v', '0', '-row-mt', '1', '-pix_fmt', 'yuv420p', path.join(OUT, `${job.name}.webm`)], { stdio: 'ignore' })
    for (const ext of ['mp4', 'webm']) {
        const size = statSync(path.join(OUT, `${job.name}.${ext}`)).size
        console.log(`${job.name}.${ext}`, (size / 1024 / 1024).toFixed(2), 'MB')
    }
    if (cat) {
        mkdirSync(POSTERS, { recursive: true })
        execFileSync('ffmpeg', ['-y', '-i', path.join(dir, 'f_0000.jpg'), '-quality', '82', path.join(POSTERS, `${job.name}.webp`)], { stdio: 'ignore' })
    }
    rmSync(dir, { recursive: true, force: true })
}

await browser.close()
