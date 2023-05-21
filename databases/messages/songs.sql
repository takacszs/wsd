DROP TABLE IF EXISTS messages;

CREATE TABLE messages (
  id SERIAL PRIMARY KEY,
  sender TEXT NOT NULL,
  message TEXT NOT NULL
);

INSERT INTO
    messages (sender, message)
VALUES
    ('alice', 'hello'), ('bob', 'bello');