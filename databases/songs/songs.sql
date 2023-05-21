DROP TABLE IF EXISTS songs;

CREATE TABLE songs (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  rating INTEGER NOT NULL
);

INSERT INTO
    songs (name, rating)
VALUES
    ('halo', 10), ('hello', 8);