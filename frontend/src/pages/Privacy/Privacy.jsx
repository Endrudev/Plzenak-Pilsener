import { Link } from 'react-router-dom'
import './Privacy.css'

export default function Privacy() {
    return (
        <div id="privacy-page">
            <div id="privacy-header-wrap">
                <div id="privacy-header">
                    <nav id="privacy-breadcrumb" aria-label="Drobečková navigace">
                        <Link to="/">Domů</Link>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M9 18l6-6-6-6" />
                        </svg>
                        <span aria-current="page">Zásady ochrany osobních údajů</span>
                    </nav>

                    <p id="privacy-eyebrow">Právní informace</p>
                    <h1 id="privacy-title">Zásady ochrany osobních údajů</h1>
                    <p id="privacy-lede">
                        Jak Plzeňák nakládá s tvými údaji, proč je potřebuje a jak s nimi můžeš sám naložit.
                    </p>

                    <div id="privacy-meta">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="9" />
                            <path d="M12 7v5l3.5 2" />
                        </svg>
                        <span>Naposledy upraveno 15. 8. 2026</span>
                    </div>
                </div>
            </div>

            <div id="privacy-body">
                <div id="privacy-main">
                    <section id="kdo-je-spravce" className="legal-section">
                        <h2>1. Kdo je správce</h2>
                        <p>
                            Správcem osobních údajů je Plzeňák z. s., se sídlem v Plzni, který provozuje web a aplikaci
                            Plzeňák — přehled kulturních, sportovních a gastro akcí v Plzni.
                        </p>
                        <p>
                            Ve všem, co se týká zpracování údajů, se na nás můžeš obrátit na{' '}
                            <a className="legal-link" href="mailto:ochranaudaju@plzenak.cz">ochranaudaju@plzenak.cz</a>.
                            Neurčili jsme pověřence pro ochranu osobních údajů, protože nezpracováváme údaje ve velkém
                            rozsahu ani systematicky nemonitorujeme veřejná místa.
                        </p>
                    </section>

                    <section id="jake-udaje-zpracovavame" className="legal-section">
                        <h2>2. Jaké údaje zpracováváme</h2>
                        <p>
                            Pro běžné prohlížení akcí od tebe nepotřebujeme nic. Nemáme registraci návštěvníků,
                            neměříme návštěvnost a nepoužíváme žádné sledovací ani reklamní skripty.
                        </p>
                        <ul>
                            <li>
                                <strong>Účet správce</strong> — e-mail a zahašované heslo (bcrypt). Vzniká jen lidem,
                                kteří web spravují, ne návštěvníkům.
                            </li>
                            <li>
                                <strong>Přihlašovací token</strong> — po přihlášení do administrace uloží tvůj
                                prohlížeč token do localStorage. Nejde o cookie, na server se posílá jen při
                                požadavcích administrace a po 8 hodinách vyprší.
                            </li>
                            <li>
                                <strong>Údaje o akcích</strong> — název, popis, datum, místo a adresa akce. Vkládá je
                                správce a jsou určené ke zveřejnění; nejsou to údaje o návštěvnících.
                            </li>
                            <li>
                                <strong>Technické záznamy serveru</strong> — běžné logy webového serveru (IP adresa,
                                čas požadavku), které vznikají provozem a slouží k ladění a ochraně proti zneužití.
                            </li>
                        </ul>
                    </section>

                    <section id="proc-udaje-zpracovavame" className="legal-section">
                        <h2>3. Proč údaje zpracováváme</h2>
                        <p>
                            Účet správce a přihlašovací token potřebujeme, aby administrace vůbec fungovala a aby se
                            do ní nedostal kdokoli. Právním základem je náš oprávněný zájem na provozu a zabezpečení
                            webu.
                        </p>
                        <p>
                            Technické záznamy serveru zpracováváme ze stejného důvodu — abychom poznali chybu nebo
                            pokus o zneužití přihlášení. Nepoužíváme je k profilování ani k marketingu a
                            nespojujeme je s žádným účtem.
                        </p>
                    </section>

                    <section id="sluzby-tretich-stran" className="legal-section">
                        <h2>4. Služby třetích stran</h2>
                        <p>
                            Web sám nenastavuje žádné cookies. Přihlášení drží localStorage, který se používá
                            výhradně pro chod administrace a smaže se odhlášením nebo vymazáním dat prohlížeče.
                        </p>
                        <ul>
                            <li>
                                <strong>OpenStreetMap</strong> — mapa na detailu akce je vložený rámec z
                                openstreetmap.org. Když se stránka s mapou načte, odejde k OpenStreetMap Foundation
                                tvá IP adresa a údaje o prohlížeči.
                            </li>
                            <li>
                                <strong>Nominatim</strong> — našeptávač adres v administraci. Dotaz odchází jen
                                tehdy, když správce píše adresu do formuláře.
                            </li>
                            <li>
                                <strong>Google Fonts</strong> — písma se stahují z fonts.googleapis.com, což
                                znamená požadavek z tvého prohlížeče na servery Google.
                            </li>
                        </ul>
                        <p>
                            Souhlasovou vrstvu (lišta s cookies a načtení mapy až po souhlasu) teprve chystáme. Do té
                            doby tenhle dokument popisuje stav, jaký reálně je — mapa i písma se načítají
                            automaticky.
                        </p>
                    </section>

                    <section id="jak-dlouho-udaje-uchovavame" className="legal-section">
                        <h2>5. Jak dlouho údaje uchováváme</h2>
                        <p>
                            Účet správce držíme po dobu, kdy se na projektu podílí, a rušíme ho, jakmile přístup
                            přestane být potřeba. Přihlašovací token vyprší za 8 hodin od přihlášení. Technické
                            záznamy serveru uchováváme nejdéle 6 měsíců.
                        </p>
                        <p>
                            Údaje o akcích zůstávají zveřejněné i po skončení akce jako archiv toho, co se ve městě
                            dělo.
                        </p>
                    </section>

                    <section id="tva-prava" className="legal-section">
                        <h2>6. Tvá práva</h2>
                        <p>
                            Vůči nám máš vždy právo na přístup ke svým údajům, jejich opravu, výmaz, omezení
                            zpracování, přenositelnost a právo vznést námitku proti zpracování z oprávněného zájmu.
                        </p>
                        <p>
                            Stačí napsat na{' '}
                            <a className="legal-link" href="mailto:ochranaudaju@plzenak.cz">ochranaudaju@plzenak.cz</a>
                            ; vyřídíme to do 30 dnů. Pokud budeš mít pocit, že s tvými údaji zacházíme špatně, můžeš
                            se obrátit na Úřad pro ochranu osobních údajů, Pplk. Sochora 27, 170 00 Praha 7.
                        </p>
                    </section>

                    <section id="zmeny-dokumentu" className="legal-section">
                        <h2>7. Změny tohoto dokumentu</h2>
                        <p>
                            Tento dokument budeme aktualizovat, pokud se změní způsob, jakým Plzeňák funguje —
                            typicky až přibude souhlasová lišta nebo měření návštěvnosti. Datum poslední úpravy
                            najdeš vždy nahoře; u větších změn dáme vědět přímo v aplikaci.
                        </p>
                    </section>

                    <div id="privacy-callout" className="legal-callout">
                        <h3>Máš dotaz k tomuto dokumentu?</h3>
                        <p>
                            Napiš nám na{' '}
                            <a className="legal-link" href="mailto:ochranaudaju@plzenak.cz">ochranaudaju@plzenak.cz</a>
                            {' '}— odpovídáme do 30 dnů, jak vyžaduje GDPR.
                        </p>
                    </div>
                </div>

                <aside id="privacy-toc">
                    <p id="privacy-toc-title">Na této stránce</p>
                    <nav>
                        <a className="legal-toc-link" href="#kdo-je-spravce">1. Kdo je správce</a>
                        <a className="legal-toc-link" href="#jake-udaje-zpracovavame">2. Jaké údaje zpracováváme</a>
                        <a className="legal-toc-link" href="#proc-udaje-zpracovavame">3. Proč údaje zpracováváme</a>
                        <a className="legal-toc-link" href="#sluzby-tretich-stran">4. Služby třetích stran</a>
                        <a className="legal-toc-link" href="#jak-dlouho-udaje-uchovavame">5. Jak dlouho údaje uchováváme</a>
                        <a className="legal-toc-link" href="#tva-prava">6. Tvá práva</a>
                        <a className="legal-toc-link" href="#zmeny-dokumentu">7. Změny tohoto dokumentu</a>
                    </nav>
                </aside>
            </div>
        </div>
    )
}
