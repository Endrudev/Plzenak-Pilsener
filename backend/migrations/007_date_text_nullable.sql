-- Textové datum přestává být povinné (2026-10-19).
--
-- První půlka kroku "contract" z postupu expand/contract (viz migrace 006).
-- Kód od této verze do date a date_short nezapisuje a nečte je, datum žije
-- jen ve starts_on. Sloupce ale ještě zůstávají: kdyby se nasazení vracelo
-- (rollback v deploy.sh vrací jen kód), předchozí verze je čte a zapisuje.
-- Smaže je až migrace 008, nasazená samostatně, až tahle verze poběží.
--
-- NOT NULL pryč, protože nový kód při vkládání akce date nevyplní.

ALTER TABLE events
    ALTER COLUMN date DROP NOT NULL,
    ALTER COLUMN date_short DROP NOT NULL;
