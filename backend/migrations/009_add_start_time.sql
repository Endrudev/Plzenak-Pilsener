-- Čas začátku akce jako samostatný sloupec (2026-11-01).
--
-- Dřív byl čas jen v textu popisu: importované akce mají jako poslední odstavec
-- přesně "Začátek v 19:00.". Vyhledávače a AI se ptají "kdy to začíná" a čas
-- v JSON-LD (startDate s hodinou) z textu vzít nejde.
--
-- Nepovinný: výstava nebo celodenní akce čas nemá a vymyšlená půlnoc by byla
-- horší než nic. Typ time (bez časového pásma): akce jsou všechny v Plzni,
-- pásmo Europe/Prague doplní aplikace až při výstupu (JSON-LD, kalendář).
--
-- Krok "expand": odstavec "Začátek v …" v popisu zatím zůstává, aby po případném
-- návratu na starý kód čas na webu nezmizel. Smaže ho až další migrace.

ALTER TABLE events ADD COLUMN start_time time;
ALTER TABLE event_candidates ADD COLUMN start_time time;

-- Doplnění z posledního odstavce popisu. Regex je ukotvený na celý odstavec,
-- takže se nechytí čas zmíněný jinde v textu ("vstup od 18:30, začátek…").
-- Neplatný čas (25:00) by přetypování ::time shodilo a celá migrace by se
-- vrátila (soubor běží jako jedna transakce); hodiny a minuty proto hlídá
-- i regex.
UPDATE events
SET start_time = substring(description[array_length(description, 1)]
                           from '^Začátek v ((?:[01]?\d|2[0-3]):[0-5]\d)\.$')::time
WHERE description[array_length(description, 1)] ~ '^Začátek v (?:[01]?\d|2[0-3]):[0-5]\d\.$';

UPDATE event_candidates
SET start_time = substring(description[array_length(description, 1)]
                           from '^Začátek v ((?:[01]?\d|2[0-3]):[0-5]\d)\.$')::time
WHERE description[array_length(description, 1)] ~ '^Začátek v (?:[01]?\d|2[0-3]):[0-5]\d\.$';
