-- Fronta návrhů akcí. Automatický import (a hromadné vkládání) nikdy nepíše přímo do
-- `events`: návrh vznikne tady jako `pending` a veřejný je až po schválení v administraci,
-- kdy se z něj vytvoří řádek v `events` a stáhne se obrázek do R2.
--
-- `source_url` je UNIQUE: stejná akce se nikdy nevloží dvakrát, a zamítnutá se nevrátí,
-- protože její řádek zůstane. `raw` drží surová zdrojová data jen kvůli ladění.
CREATE TABLE IF NOT EXISTS event_candidates (
    id serial PRIMARY KEY,
    source_url text NOT NULL UNIQUE,
    status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    name text NOT NULL,
    date text NOT NULL,
    date_short text NOT NULL,
    location text NOT NULL,
    tags text[] NOT NULL DEFAULT '{}',
    description text[] NOT NULL,
    source_image_url text,
    raw jsonb,
    event_id integer REFERENCES events(id) ON DELETE SET NULL,
    created_at timestamptz DEFAULT now(),
    reviewed_at timestamptz
);

CREATE INDEX IF NOT EXISTS event_candidates_status_idx ON event_candidates (status, created_at);
