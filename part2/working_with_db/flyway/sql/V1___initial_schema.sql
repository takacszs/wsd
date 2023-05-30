CREATE TABLE tickets (
    id SERIAL PRIMARY KEY,
    content TEXT NOT NULL,
    reported_on TIMESTAMP WITH TIME ZONE,
    resolved_on TIMESTAMP WITH TIME ZONE
);

INSERT INTO tickets (content)
VALUES ('hammertime');

