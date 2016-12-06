CREATE TABLE Users
(id INTEGER NOT NULL PRIMARY KEY,
username VARCHAR(256) NOT NULL UNIQUE,
password VARCHAR(256) NOT NULL CHECK (char_length(password) > 7));

CREATE TABLE Location
(id INTEGER NOT NULL PRIMARY KEY,
name VARCHAR(256) NOT NULL UNIQUE,
x FLOAT NOT NULL,
y FLOAT NOT NULL);

CREATE TABLE Tags 
(title VARCHAR(256) NOT NULL PRIMARY KEY);

CREATE TABLE Post
(id INTEGER NOT NULL PRIMARY KEY,
location_id INTEGER NOT NULL REFERENCES Location,
title VARCHAR(20) NOT NULL,
body VARCHAR(140) NOT NULL,
start_time TIMESTAMP NOT NULL,
end_time TIMESTAMP NOT NULL,
post_time TIMESTAMP NOT NULL,
user_id INTEGER NOT NULL REFERENCES Users,
reports INTEGER NOT NULL,
tag_1 VARCHAR(256) REFERENCES Tags,
tag_2 VARCHAR(256) REFERENCES Tags,
tag_3 VARCHAR(256) REFERENCES Tags);


CREATE OR REPLACE FUNCTION Remove_Dups()  
RETURNS trigger AS  
$$  
BEGIN  
    DELETE FROM Post WHERE reports >= 5;
    RETURN NEW;  
END;  
$$  
LANGUAGE 'plpgsql'; 


CREATE TRIGGER Duplicate AFTER UPDATE OF reports ON Post
FOR EACH ROW EXECUTE PROCEDURE Remove_Dups();



# Test values
INSERT INTO Users VALUES (1, 'William', 'password');
INSERT INTO Users VALUES (2, 'Dennis', '12345678');
INSERT INTO Users VALUES (3, 'Vanessa', 'sonamain');

INSERT INTO Location VALUES (1, 'Bryan Center', 150.0, 200.0);
INSERT INTO Location VALUES (2, 'West Union', 250.5, 300.6);
INSERT INTO Location VALUES (3, 'Bus Circle', 350.7, 400.8);

INSERT INTO Location VALUES (1, 'Bryan Center', 36.001174, -78.941041);
INSERT INTO Location VALUES (2, 'West Union', 36.000925, -78.939289);
INSERT INTO Location VALUES (3, 'Bus Circle', 36.000964, -78.938309);

INSERT INTO Tags VALUES ('free food');
INSERT INTO Tags VALUES ('speaker');
INSERT INTO Tags VALUES ('club');

INSERT INTO Post VALUES (1, 1, 'FOOD', 'Free food!', '2016-12-15 12:00:00', '2016-12-15 13:00:00', '2016-12-4 15:00:00', 1, 0, 'free food', NULL, NULL);
INSERT INTO Post VALUES (2, 3, 'Prez', 'Obama', '2016-12-16 12:00:00', '2016-12-15 14:00:00', '2016-12-5 12:00:00', 3, 2, 'speaker', NULL, NULL);
INSERT INTO Post VALUES (3, 1, 'Dance', 'DCD Auditions', '2016-12-14 18:00:00', '2016-12-14 20:00:00', '2016-12-3 13:00:00', 2, 0, 'club', NULL, NULL);

INSERT INTO Post VALUES (4, 1, 'FOOD', 'Free food!', '2016-12-15 12:00:00', '2016-12-15 13:00:00', '2016-12-4 15:00:00', 1, 0, 'free food', NULL, NULL);

UPDATE Location SET (x, y) = (36.001174, -78.941041)
WHERE id = 1;
UPDATE Location SET (x, y) = (36.000925, -78.939289)
WHERE id = 2;
UPDATE Location SET (x, y) = (36.000964, -78.938309)
WHERE id = 3;
UPDATE Location SET name = 'West Campus Bus Stop' WHERE id = 3;

INSERT INTO Tags VALUES ('free');
INSERT INTO Tags VALUES ('food');
INSERT INTO Tags VALUES ('talk');
INSERT INTO Tags VALUES ('art');
INSERT INTO Tags VALUES ('dance');
INSERT INTO Tags VALUES ('music');
INSERT INTO Tags VALUES ('movie');
