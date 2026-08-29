-- Plaketa („Dnes") je odvozená informace, ne vlastnost akce: závisí na dnešním
-- datu, takže uložená hodnota zastará hned druhý den. Sloupce navíc nikdy nikdo
-- nenaplnil — oba admin formuláře posílaly natvrdo null. Plaketa se nově počítá
-- na frontendu z events.date.
--
-- 001_create_tables.sql se nepřepisuje: už aplikovanou migraci nelze měnit,
-- protože databáze, kde proběhla, by se o změně nedozvěděly. Na čisté databázi
-- se sloupce vytvoří a tahle migrace je zase zahodí.
ALTER TABLE events DROP COLUMN IF EXISTS badge;
ALTER TABLE events DROP COLUMN IF EXISTS badge_type;
