USE database;

DROP TABLE IF EXISTS hero;

CREATE TABLE hero (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    actor VARCHAR(255) NOT NULL,  
);

INSERT INTO 
    hero (name, actor)
VALUES
    ('Thor', 'Chris Hemsworth'),
    ('Loki', 'Tom Hiddleston'),
    ('Black widow', 'Scarlet Johansson'),
    ('Barry allen', 'Grant Gustin');