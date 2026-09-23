import { Link } from 'react-router-dom'
import { Scene1, Scene2, Scene3, Bulbs, BULBS_V1, BULBS_V2, RaiseArm, BalloonIcon } from './RestScenes.jsx'
import './HeroTileRest.css'

// Tři výjevy (Scene1/2/3), girlanda žárovek (Bulbs) i přípitek/balónek
// (RaiseArm/BalloonIcon) žijí teď v RestScenes.jsx — sdílené s velkým hero
// pásem na /zbytek-programu (ZbytekProgramu.jsx), stejný vzor jako
// MusicScene.jsx pro Hudba.

// Doslovná rekonstrukce Zbytek programu dlaždice: NENÍ celotělová scéna
// jako Hudba/TOP, ale malý "pohled" 222×200px v pravém horním rohu se
// třemi večerními výjevy, co se prolínají (rozostření + mlha mezi nimi),
// nad prvními dvěma girlanda žárovek. Text (nadpis, "Procházet vše" a
// kategorie) leží mimo scénu, ne přes ni.
export default function HeroTileRest({ categories = [] }) {
    return (
        <Link to="/zbytek-programu" className="hero-tile hero-tile--rest">
            <div className="ht-rest-bg" aria-hidden="true" />

            <div className="vig" aria-hidden="true">
                <div className="scn scn--v1">
                    <Scene1 />
                    <Bulbs list={BULBS_V1} />
                </div>

                <div className="scn scn--v2">
                    <Scene2 />
                    <Bulbs list={BULBS_V2} />
                    <span className="raise">
                        <RaiseArm />
                    </span>
                </div>

                <div className="scn scn--v3">
                    <Scene3 />
                    <span className="balloon">
                        <BalloonIcon />
                    </span>
                </div>

                <span className="mist" />
            </div>

            <div className="hero-tile-overlay">
                <div className="ht-rest-top">
                    <h2 className="hero-tile-title hero-tile-title--sm">Zbytek programu</h2>
                    <span className="ht-rest-browse">
                        Procházet vše
                        <span className="ht-rest-browse-go" aria-hidden="true">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
                            </svg>
                        </span>
                    </span>
                </div>

                <div className="ht-rest-cats">
                    {categories.slice(0, 5).map(cat => (
                        <span key={cat.name} className="ht-rest-cat">
                            <span className="ht-rest-cat-icon">{cat.icon(20)}</span>
                            <span className="ht-rest-cat-label">{cat.name}</span>
                        </span>
                    ))}
                </div>
            </div>
        </Link>
    )
}
