const I = require("./PlzenakIcons.jsx");

const GROUPS = [
  { title: "Kategorie", note: "obarvuj tokenem --category-*", items: [
    ["CategoryKultura", "category-kultura.svg", "Kultura"],
    ["CategorySport", "category-sport.svg", "Sport"],
    ["CategoryGastro", "category-gastro.svg", "Gastro"],
    ["CategoryHudba", "category-hudba.svg", "Hudba"],
    ["CategoryPamatky", "category-pamatky.svg", "Památky"],
    ["CategoryDeti", "category-deti.svg", "Pro děti"],
  ]},
  { title: "UI", note: "24×24 · stroke 1.75 · currentColor", items: [
    ["IconMapPin","icon-map-pin.svg","Pin"],["IconMap","icon-map.svg","Mapa"],
    ["IconCalendar","icon-calendar.svg","Kalendář"],["IconCalendarPlus","icon-calendar-plus.svg","Do kalendáře"],
    ["IconClock","icon-clock.svg","Čas"],["IconSearch","icon-search.svg","Hledat"],
    ["IconFilter","icon-filter.svg","Filtr"],["IconShare","icon-share.svg","Sdílet"],
    ["IconEye","icon-eye.svg","Náhled"],["IconEdit","icon-edit.svg","Upravit"],
    ["IconTrash","icon-trash.svg","Smazat"],["IconChevronLeft","icon-chevron-left.svg","Carousel ‹"],
    ["IconChevronRight","icon-chevron-right.svg","Carousel ›"],["IconArrowLeft","icon-arrow-left.svg","Zpět"],
    ["IconArrowRight","icon-arrow-right.svg","Dál"],["IconArrowUpRight","icon-arrow-up-right.svg","Odkaz"],
    ["IconCheck","icon-check.svg","Potvrzeno"],["IconX","icon-x.svg","Zavřít"],
    ["IconPlus","icon-plus.svg","Přidat"],["IconHeart","icon-heart.svg","Uložit"],
    ["IconStar","icon-star.svg","TOP akce"],["IconTicket","icon-ticket.svg","Vstupenka"],
    ["IconMenu","icon-menu.svg","Menu"],["IconList","icon-list.svg","Seznam"],
    ["IconUser","icon-user.svg","Uživatel"],["IconLock","icon-lock.svg","Admin"],
    ["IconInfo","icon-info.svg","Info"],["IconCookie","icon-cookie.svg","Cookies"],
  ]},
  { title: "Denní doba", note: "štítky Dnes / večer", items: [
    ["IconSun","icon-sun.svg","Den"],["IconSunset","icon-sunset.svg","Podvečer"],["IconMoon","icon-moon.svg","Noc"],
  ]},
];

const CAT_COLOR = {
  CategoryKultura: "var(--category-kultura)", CategorySport: "var(--category-sport)",
  CategoryGastro: "var(--category-gastro)", CategoryHudba: "var(--category-hudba)",
  CategoryPamatky: "var(--category-pamatky)", CategoryDeti: "var(--category-deti)",
};

function Cell({ name, file, label }) {
  const C = I[name];
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 9, padding: "18px 10px 14px", background: "var(--surface)", border: "1px solid var(--hairline)", borderRadius: 12 }}>
      <span style={{ display: "inline-flex", color: CAT_COLOR[name] || "var(--ink)" }}><C size={28} /></span>
      <span style={{ fontSize: 12.5, fontWeight: 500, color: "var(--ink)", textAlign: "center" }}>{label}</span>
      <code style={{ fontSize: 10.5, color: "var(--ink-3)", textAlign: "center", wordBreak: "break-all" }}>{file}</code>
    </div>
  );
}

function IconGallery() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 30 }}>
      {GROUPS.map((g) => (
        <div key={g.title} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
            <h2 style={{ margin: 0, fontFamily: "var(--font-display)", fontSize: 20, fontWeight: 600, letterSpacing: "-0.01em", color: "var(--ink)" }}>{g.title}</h2>
            <span style={{ fontSize: 13, color: "var(--ink-3)" }}>{g.note}</span>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(132px,1fr))", gap: 12 }}>
            {g.items.map((it) => <Cell key={it[0]} name={it[0]} file={it[1]} label={it[2]} />)}
          </div>
        </div>
      ))}
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
          <h2 style={{ margin: 0, fontFamily: "var(--font-display)", fontSize: 20, fontWeight: 600, letterSpacing: "-0.01em", color: "var(--ink)" }}>Brand mark</h2>
          <span style={{ fontSize: 13, color: "var(--ink-3)" }}>24×32 · fill currentColor</span>
        </div>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          {[["brand-mark.svg", false, "var(--sun)"], ["brand-mark-p.svg", true, "var(--sun)"], ["brand-mark-p.svg (ink)", true, "var(--ink)"]].map((b, i) => (
            <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 9, padding: "18px 22px 14px", background: "var(--surface)", border: "1px solid var(--hairline)", borderRadius: 12 }}>
              <span style={{ display: "inline-flex", color: b[2] }}><I.BrandMark size={44} withP={b[1]} /></span>
              <code style={{ fontSize: 10.5, color: "var(--ink-3)" }}>{b[0]}</code>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

module.exports = { IconGallery };
