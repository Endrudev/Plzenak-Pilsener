-- Smazání textového data (2026-10-19).
--
-- Druhá půlka kroku "contract" (viz migrace 006 a 007). Od migrace 007
-- aplikace date ani date_short nečte ani nezapisuje, datum je jen ve
-- starts_on. Tahle migrace jde v samostatném nasazení, až verze s 007 běží
-- na produkci: rollback by se pak vracel na kód, který sloupce nepotřebuje.
--
-- event_candidates.date a date_short zůstávají (neveřejná fronta, převádí
-- se na starts_on až při schválení).

ALTER TABLE events
    DROP COLUMN date,
    DROP COLUMN date_short;
