import { Link } from 'react-router-dom'
import './Terms.css'

export default function Terms() {
    return (
        <div id="terms-page">
            <div id="terms-header-wrap">
                <div id="terms-header">
                    <nav id="terms-breadcrumb" aria-label="Drobečková navigace">
                        <Link to="/">Domů</Link>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M9 18l6-6-6-6" />
                        </svg>
                        <span aria-current="page">Podmínky užití</span>
                    </nav>

                    <p id="terms-eyebrow">Právní informace</p>
                    <h1 id="terms-title">Podmínky užití</h1>
                    <p id="terms-lede">
                        Co Plzeňák je, co od něj můžeš čekat a co po tobě chceme na oplátku.
                    </p>

                    <div id="terms-meta">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="9" />
                            <path d="M12 7v5l3.5 2" />
                        </svg>
                        <span>Naposledy upraveno 15. 8. 2026</span>
                    </div>
                </div>
            </div>

            <div id="terms-body">
                <div id="terms-main">
                    <section id="co-je-plzenak" className="legal-section">
                        <h2>1. Co je Plzeňák</h2>
                        <p>
                            Plzeňák je nekomerční přehled kulturních, sportovních a gastro akcí v Plzni. Provozuje
                            ho Plzeňák z. s. se sídlem v Plzni.
                        </p>
                        <p>
                            Web je informační rozcestník. Nejsme pořadatel žádné z uvedených akcí, neprodáváme
                            vstupenky a nezprostředkováváme rezervace.
                        </p>
                    </section>

                    <section id="kdo-muze-web-uzivat" className="legal-section">
                        <h2>2. Kdo může web užívat</h2>
                        <p>
                            Prohlížení akcí je zdarma a bez registrace — nemusíš zakládat účet ani nám nic sdělovat.
                        </p>
                        <p>
                            Účet existuje jen pro správce, kteří akce vkládají. Přístupové údaje jsou osobní,
                            nepředávej je dál a při podezření na zneužití nám dej vědět na{' '}
                            <a className="legal-link" href="mailto:ochranaudaju@plzenak.cz">ochranaudaju@plzenak.cz</a>.
                        </p>
                    </section>

                    <section id="obsah-akci" className="legal-section">
                        <h2>3. Obsah akcí a jeho přesnost</h2>
                        <p>
                            Údaje o akcích vkládají správci ručně na základě informací od pořadatelů a z veřejných
                            zdrojů. Snažíme se je držet aktuální, ale nemůžeme ručit za to, že akce proběhne, že se
                            nezmění čas, místo nebo cena, ani že popis odpovídá skutečnosti.
                        </p>
                        <ul>
                            <li>Před cestou na akci si údaje ověř přímo u pořadatele — odkaz na jeho web najdeš na detailu akce.</li>
                            <li>Zrušené nebo přesunuté akce se v přehledu mohou objevit ještě chvíli poté, co se změna stala.</li>
                            <li>Adresa a mapa jsou orientační a vznikají automatickým vyhledáním adresy.</li>
                        </ul>
                        <p>Pokud najdeš chybu, napiš nám — opravíme ji.</p>
                    </section>

                    <section id="obsah-tretich-stran" className="legal-section">
                        <h2>4. Odkazy a obsah třetích stran</h2>
                        <p>
                            Z detailu akce vedou odkazy na weby pořadatelů a na mapové podklady OpenStreetMap. Za
                            obsah cizích webů, jejich dostupnost ani za podmínky, které si stanovují, neodpovídáme.
                        </p>
                        <p>
                            Mapové podklady poskytuje OpenStreetMap a jsou dostupné pod licencí ODbL; jejich autory
                            jsou přispěvatelé OpenStreetMap.
                        </p>
                    </section>

                    <section id="autorska-prava" className="legal-section">
                        <h2>5. Obsah webu a autorská práva</h2>
                        <p>
                            Zdrojový kód projektu je veřejný na GitHubu a řídí se licencí, která je tam uvedená.
                            Texty, návrh a grafika webu patří provozovateli.
                        </p>
                        <p>
                            Názvy, loga a fotografie akcí patří jejich pořadatelům a používáme je jen k označení
                            konkrétní akce. Pokud jsi pořadatel a nepřeješ si, aby se tvoje akce na webu objevovala,
                            napiš nám a stáhneme ji.
                        </p>
                    </section>

                    <section id="dostupnost-a-odpovednost" className="legal-section">
                        <h2>6. Dostupnost a odpovědnost</h2>
                        <p>
                            Plzeňák provozujeme „tak, jak je". Negarantujeme nepřetržitou dostupnost, bezchybnost
                            ani to, že web bude fungovat v budoucnu — jde o projekt provozovaný ve volném čase,
                            který můžeme kdykoli odstavit nebo změnit.
                        </p>
                        <p>
                            Neodpovídáme za škodu vzniklou tím, že ses spolehl na údaj uvedený na webu, ani za
                            nedostupnost služby. Tím není dotčena odpovědnost, které se podle českého práva vzdát
                            nelze.
                        </p>
                    </section>

                    <section id="zakazane-jednani" className="legal-section">
                        <h2>7. Co na webu dělat nesmíš</h2>
                        <ul>
                            <li>Pokoušet se obejít přihlášení do administrace nebo získat cizí přístupové údaje.</li>
                            <li>Automatizovaně stahovat obsah ve velkém rozsahu nebo zahlcovat rozhraní požadavky — přihlašování je z tohoto důvodu omezené počtem pokusů.</li>
                            <li>Vkládat obsah, který je protiprávní, klamavý nebo zasahuje do práv třetích osob.</li>
                            <li>Narušovat provoz webu, jeho zabezpečení nebo integritu dat.</li>
                        </ul>
                        <p>Při porušení můžeme přístup omezit nebo zrušit.</p>
                    </section>

                    <section id="zmeny-podminek" className="legal-section">
                        <h2>8. Změny podmínek a rozhodné právo</h2>
                        <p>
                            Podmínky můžeme upravit, pokud se změní způsob, jakým Plzeňák funguje. Aktuální znění
                            je vždy dostupné na této stránce a platí datem poslední úpravy uvedeným nahoře.
                        </p>
                        <p>Vztahy vzniklé užíváním webu se řídí českým právem.</p>
                    </section>

                    <div id="terms-callout" className="legal-callout">
                        <h3>Něco ti tu nesedí?</h3>
                        <p>
                            Napiš nám na{' '}
                            <a className="legal-link" href="mailto:ochranaudaju@plzenak.cz">ochranaudaju@plzenak.cz</a>
                            {' '}— chybu v údajích o akci opravíme, na dotaz k podmínkám odpovíme.
                        </p>
                    </div>
                </div>

                <aside id="terms-toc">
                    <p id="terms-toc-title">Na této stránce</p>
                    <nav>
                        <a className="legal-toc-link" href="#co-je-plzenak">1. Co je Plzeňák</a>
                        <a className="legal-toc-link" href="#kdo-muze-web-uzivat">2. Kdo může web užívat</a>
                        <a className="legal-toc-link" href="#obsah-akci">3. Obsah akcí a jeho přesnost</a>
                        <a className="legal-toc-link" href="#obsah-tretich-stran">4. Odkazy a obsah třetích stran</a>
                        <a className="legal-toc-link" href="#autorska-prava">5. Obsah webu a autorská práva</a>
                        <a className="legal-toc-link" href="#dostupnost-a-odpovednost">6. Dostupnost a odpovědnost</a>
                        <a className="legal-toc-link" href="#zakazane-jednani">7. Co na webu dělat nesmíš</a>
                        <a className="legal-toc-link" href="#zmeny-podminek">8. Změny podmínek a rozhodné právo</a>
                    </nav>
                </aside>
            </div>
        </div>
    )
}
