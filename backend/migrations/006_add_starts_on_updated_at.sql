-- Datum konání jako skutečné datum a čas poslední úpravy (2026-10-19).
--
-- Krok "expand" z postupu expand/contract: textové sloupce date a date_short
-- zůstávají a aplikace dál zapisuje do obou. Smažou se až další migrací, až
-- bude tahle ověřená na produkci. Důvod: deploy.sh pouští migraci dřív, než
-- nastartuje nový backend, a rollback vrací jen kód, ne databázi. Starý kód
-- proto musí s novým schématem pořád fungovat.
--
-- Celý soubor běží jako jedna transakce (víc příkazů v jednom dotazu), takže
-- když TO_DATE narazí na nečitelné datum, nezmění se nic.

ALTER TABLE events ADD COLUMN starts_on date;
UPDATE events SET starts_on = TO_DATE(date, 'DD.MM.YYYY');
ALTER TABLE events ALTER COLUMN starts_on SET NOT NULL;

-- Filtry i výchozí řazení jdou přes starts_on; s TO_DATE nad textem index
-- použít nešel.
CREATE INDEX events_starts_on_idx ON events (starts_on);

-- updated_at nastavuje aplikace ručně v každém UPDATE (updated_at = now()),
-- bez triggeru. Stávající akce dostanou čas vytvoření.
ALTER TABLE events ADD COLUMN updated_at timestamptz;
UPDATE events SET updated_at = COALESCE(created_at, now());
ALTER TABLE events
    ALTER COLUMN updated_at SET NOT NULL,
    ALTER COLUMN updated_at SET DEFAULT now();
