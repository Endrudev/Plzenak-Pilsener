CREATE TABLE IF NOT EXISTS events (
    id serial PRIMARY KEY,
    name text NOT NULL,
    date text,
    date_short text,
    location text,
    tags text[],
    badge text,
    badge_type text,
    img_class text,
    url text,
    description text[],
    map_src text,
    created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS admins (
    id serial PRIMARY KEY,
    email text UNIQUE NOT NULL,
    password_hash text NOT NULL,
    created_at timestamptz DEFAULT now()
);