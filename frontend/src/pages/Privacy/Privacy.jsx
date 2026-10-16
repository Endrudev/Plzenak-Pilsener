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
                        <span>Naposledy upraveno 16. 10. 2026</span>
                    </div>
                </div>
            </div>

            <div id="privacy-body">
                <div id="privacy-main">
                    <section id="kdo-je-spravce" className="legal-section">
                        <h2>1. Kdo je správce</h2>
                        <p>
                            Správcem osobních údajů je fyzická osoba, autor projektu Plzeňák — přehledu kulturních,
                            sportovních a gastro akcí v Plzni. Plzeňák je nekomerční učební projekt bez zisku, není
                            nijak propagovaný ani určený ke škálování.
                        </p>
                        <p>
                            Ve všem, co se týká zpracování údajů, se na nás můžeš obrátit na{' '}
                            <a className="legal-link" href="mailto:ochranaudaju@plzenak.eu">ochranaudaju@plzenak.eu</a>.
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
                                <strong>Technické záznamy serveru</strong> — při každé návštěvě webový server zapíše
                                tvou IP adresu, čas požadavku, adresu stránky a údaj o prohlížeči. Vznikají samy
                                provozem webu.
                            </li>
                            <li>
                                <strong>Omezení pokusů o přihlášení</strong> — server si na 15 minut v paměti
                                pamatuje IP adresu, ze které přišel pokus o přihlášení do administrace, aby šlo
                                zastavit hádání hesel. Nikam se neukládá a restartem serveru zmizí.
                            </li>
                            <li>
                                <strong>Úložiště prohlížeče (localStorage)</strong> — web nenastavuje žádné cookies.
                                V paměti tvého prohlížeče uloží jen záznam o tvém rozhodnutí o souhlasu
                                (<code>plzenak-consent</code>: verze, čas a volba) a případně volbu světlého nebo
                                tmavého vzhledu (<code>plzenak-theme</code>). Na server se nic z toho neposílá.
                            </li>
                            <li>
                                <strong>Účet správce</strong> — e-mail a zahašované heslo (bcrypt). Vzniká jen lidem,
                                kteří web spravují, ne návštěvníkům. Po přihlášení do administrace prohlížeč
                                uloží přihlašovací token (<code>token</code>), který po 8 hodinách vyprší.
                            </li>
                            <li>
                                <strong>Údaje o akcích</strong> — název, popis, datum, místo a adresa akce a obrázek.
                                Vkládá je správce a jsou určené ke zveřejnění; nejsou to údaje o návštěvnících.
                            </li>
                            <li>
                                <strong>E-maily, které nám napíšeš</strong> — když pošleš zprávu na adresu uvedenou
                                výš, zpracujeme tvou e-mailovou adresu a obsah zprávy, abychom ti mohli odpovědět.
                            </li>
                        </ul>
                    </section>

                    <section id="proc-udaje-zpracovavame" className="legal-section">
                        <h2>3. Proč údaje zpracováváme</h2>
                        <p>
                            Technické záznamy, omezení pokusů o přihlášení, účet správce a přihlašovací token
                            potřebujeme, aby web a administrace fungovaly a aby se do administrace nedostal kdokoli.
                            Právním základem je náš oprávněný zájem na provozu a zabezpečení webu (čl. 6 odst. 1
                            písm. f) GDPR). Nepoužíváme je k profilování ani k marketingu a nespojujeme je s žádným
                            účtem.
                        </p>
                        <p>
                            Zprávy, které nám napíšeš, zpracováváme, abychom ti odpověděli, na základě našeho
                            oprávněného zájmu na vyřízení tvého dotazu.
                        </p>
                        <p>
                            Načtení mapy (viz níže) a uložení záznamu o souhlasu probíhá na základě tvého souhlasu
                            (čl. 6 odst. 1 písm. a) GDPR). Souhlas můžeš kdykoli odvolat v{' '}
                            <strong>Nastavení cookies</strong> v patičce webu.
                        </p>
                    </section>

                    <section id="sluzby-tretich-stran" className="legal-section">
                        <h2>4. Komu údaje předáváme</h2>
                        <p>
                            Web provozují a jeho části zajišťují tyto služby třetích stran. Žádné z nich nevyužíváme
                            k reklamě ani k měření návštěvnosti.
                        </p>
                        <ul>
                            <li>
                                <strong>Amazon Web Services (AWS)</strong> — hosting serveru, na kterém web běží, v
                                regionu EU (Stockholm, Švédsko). Server zpracovává technické záznamy a údaje správce.
                            </li>
                            <li>
                                <strong>Cloudflare</strong> — správa domény (DNS), úložiště obrázků akcí na adrese
                                cdn.plzenak.eu (R2), uložení záloh databáze a přeposílání e-mailů zaslaných na adresu
                                pro ochranu údajů. Při načtení obrázku akce vidí Cloudflare tvou IP adresu.
                            </li>
                            <li>
                                <strong>Google (Gmail)</strong> — e-maily poslané na adresu pro ochranu údajů se
                                přeposílají do schránky provozovatele.
                            </li>
                            <li>
                                <strong>OpenStreetMap</strong> — mapa na detailu akce je vložený rámec z
                                openstreetmap.org, který se načte <strong>až po tvém souhlasu</strong>. Když se
                                načte, odejde k OpenStreetMap Foundation tvá IP adresa a údaje o prohlížeči.
                            </li>
                            <li>
                                <strong>Nominatim</strong> — našeptávač adres v administraci. Dotaz odchází jen
                                tehdy, když správce píše adresu do formuláře akce, návštěvníků se netýká.
                            </li>
                        </ul>
                        <p>
                            Písma na webu jsou ukládaná přímo u nás, takže při jejich načtení nic neodchází k
                            třetím stranám.
                        </p>
                        <p>
                            Amazon a Cloudflare jsou společnosti ze Spojených států. Data hostujeme v EU, ale
                            Cloudflare provozuje síť po celém světě a údaje tak mohou být zpracovány i mimo EU.
                            Poskytovatelé se při předávání opírají o mechanismy, které evropské právo uznává
                            (rozhodnutí o odpovídající ochraně v rámci EU–US Data Privacy Framework nebo standardní
                            smluvní doložky).
                        </p>
                    </section>

                    <section id="jak-dlouho-udaje-uchovavame" className="legal-section">
                        <h2>5. Jak dlouho údaje uchováváme</h2>
                        <ul>
                            <li>
                                <strong>Technické záznamy serveru</strong> — jen krátce, v řádu týdnů, po kterých se
                                automaticky přepíšou novými.
                            </li>
                            <li>
                                <strong>Omezení pokusů o přihlášení</strong> — 15 minut, jen v paměti serveru.
                            </li>
                            <li>
                                <strong>Přihlašovací token</strong> — vyprší za 8 hodin od přihlášení.
                            </li>
                            <li>
                                <strong>Záznam o souhlasu a volba vzhledu</strong> — v tvém prohlížeči, dokud ho
                                nesmažeš (například vymazáním dat webu).
                            </li>
                            <li>
                                <strong>Účet správce</strong> — po dobu, kdy se na projektu podílí, zrušíme ho,
                                jakmile přístup přestane být potřeba.
                            </li>
                            <li>
                                <strong>Zálohy databáze</strong> — 14 dní, poté se automaticky smažou. Obsahují
                                stejné údaje jako databáze, tedy jen účet správce a údaje o akcích.
                            </li>
                            <li>
                                <strong>E-maily od tebe</strong> — jen po dobu nezbytnou k vyřízení dotazu.
                            </li>
                            <li>
                                <strong>Údaje o akcích</strong> — zůstávají zveřejněné i po skončení akce jako archiv
                                toho, co se ve městě dělo.
                            </li>
                        </ul>
                    </section>

                    <section id="tva-prava" className="legal-section">
                        <h2>6. Tvá práva</h2>
                        <p>
                            Vůči nám máš vždy právo na přístup ke svým údajům, jejich opravu, výmaz, omezení
                            zpracování, přenositelnost a právo vznést námitku proti zpracování z oprávněného zájmu.
                            Souhlas s načtením mapy můžeš kdykoli odvolat v <strong>Nastavení cookies</strong> v
                            patičce.
                        </p>
                        <p>
                            Stačí napsat na{' '}
                            <a className="legal-link" href="mailto:ochranaudaju@plzenak.eu">ochranaudaju@plzenak.eu</a>
                            ; vyřídíme to do 30 dnů. Pokud budeš mít pocit, že s tvými údaji zacházíme špatně, můžeš
                            se obrátit na Úřad pro ochranu osobních údajů, Pplk. Sochora 27, 170 00 Praha 7.
                        </p>
                    </section>

                    <section id="zmeny-dokumentu" className="legal-section">
                        <h2>7. Změny tohoto dokumentu</h2>
                        <p>
                            Tento dokument budeme aktualizovat, pokud se změní způsob, jakým Plzeňák funguje —
                            například přibude služba třetí strany nebo měření návštěvnosti. Datum poslední úpravy
                            najdeš vždy nahoře.
                        </p>
                    </section>

                    <div id="privacy-callout" className="legal-callout">
                        <h3>Máš dotaz k tomuto dokumentu?</h3>
                        <p>
                            Napiš nám na{' '}
                            <a className="legal-link" href="mailto:ochranaudaju@plzenak.eu">ochranaudaju@plzenak.eu</a>
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
                        <a className="legal-toc-link" href="#sluzby-tretich-stran">4. Komu údaje předáváme</a>
                        <a className="legal-toc-link" href="#jak-dlouho-udaje-uchovavame">5. Jak dlouho údaje uchováváme</a>
                        <a className="legal-toc-link" href="#tva-prava">6. Tvá práva</a>
                        <a className="legal-toc-link" href="#zmeny-dokumentu">7. Změny tohoto dokumentu</a>
                    </nav>
                </aside>
            </div>
        </div>
    )
}
