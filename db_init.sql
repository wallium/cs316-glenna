SET TIME ZONE 'EST';

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

INSERT INTO Users VALUES (1, 'twillster', 'password');
INSERT INTO Users VALUES (2, 'superpi', '12345678');
INSERT INTO Users VALUES (3, 'snorlaZZZzzz', 'sonamain');
INSERT INTO Users VALUES (4, 'shwingy', '12345678');
INSERT INTO Users VALUES (5, 'swablulu', '12345678');
INSERT INTO Users VALUES (6, 'madaraFTW', '12345678');
INSERT INTO Users VALUES (7, 'Mcjaj', '12345678');


INSERT INTO Location VALUES (1, 'Bryan Center', 36.001174, -78.941041);
INSERT INTO Location VALUES (2, 'West Union',36.000925, -78.939289);
INSERT INTO Location VALUES (3, 'Bus Circle', 36.000964, -78.938309);
INSERT INTO Location VALUES (4, 'Wilson Rec Center', 35.997282, -78.941386);
INSERT INTO Location VALUES (5, 'Perkins Library', 36.002069, -78.938669);


INSERT INTO Tags VALUES ('free');
INSERT INTO Tags VALUES ('food');
INSERT INTO Tags VALUES ('talk');
INSERT INTO Tags VALUES ('art');
INSERT INTO Tags VALUES ('dance');
INSERT INTO Tags VALUES ('music');
INSERT INTO Tags VALUES ('movie');
INSERT INTO Tags VALUES ('concert');
INSERT INTO Tags VALUES ('for sale');
INSERT INTO Tags VALUES ('psa');
INSERT INTO Tags VALUES ('health');


INSERT INTO Post VALUES (1, 1, 'Free Doughnuts', 'Giving away free Krispy Kreme doughnuts today for NAMI and mental health awareness!', '2016-12-15 12:00:00', '2016-12-15 13:00:00', '2016-12-4 15:00:00', 4, 0, 'free', 'food', NULL);
INSERT INTO Post VALUES (2, 1, 'Duke Store Sale', 'Drop by the Duke Store for some nice Duke swag! Select t-shirts for $5.', '2016-12-15 00:00:00', '2016-12-15 23:59:00', '2016-12-4 15:00:00', 6, 0, 'movie', NULL, NULL);
INSERT INTO Post VALUES (3, 1, 'Mulan Singalong', 'screening of mulan today in Griffith theater, come and sing', '2016-12-15 12:00:00', '2016-12-15 20:00:00', '2016-12-4 21:30:00', 2, 0, 'movie', 'free', NULL);
INSERT INTO Post VALUES (4, 1, 'Flu Shots', 'Free flu shots in the BC! Come get vaccinated and stay sickness-free this winter!', '2016-12-13 00:00:00', '2016-12-14 00:00:00', '2016-12-05 13:13:00', 4, 0, 'free', 'health', 'psa');
INSERT INTO Post VALUES (5, 2, 'Gordon Ramsay Class', 'Come for free tasting and cooking class by famous international chef Gordon Ramsay!', '2016-12-16 12:00:00', '2016-12-15 14:00:00', '2016-12-5 12:00:00', 3, 2, 'speaker', 'food', 'free');
INSERT INTO Post VALUES (6, 2, 'Midnight Breakfast', 'For only 6 food points come out for delicious breakfast food during reading period. First 500 get a free tshirt', '2016-12-16 12:00:00', '2016-12-15 23:00:00', '2016-12-6 01:00:00', 7, 2, 'food', NULL, NULL);
INSERT INTO Post VALUES (7, 3, 'Shuttle to RDU', 'Shuttles to the airport will be running all day on 1 hr intervals for free', '2016-12-14 18:00:00', '2016-12-14 20:00:00', '2016-12-3 13:00:00', 5, 0, 'psa', 'free', NULL);
INSERT INTO Post VALUES (8, 3, '$1 Doughnuts', 'Deja Blue is selling KK doughnuts to raise funds for a new album. Please come by and enjoy!', '2016-12-14 18:00:00', '2016-12-14 20:00:00', '2016-12-3 13:00:00', 4, 0, 'food', NULL, NULL);
INSERT INTO Post VALUES (9, 4, 'DCD Auditions', 'Come try out for a really cool cultural dance group on campus! We accept people of all age/genders/experience.', '2016-12-14 18:00:00', '2016-12-14 20:00:00', '2016-12-3 13:00:00', 4, 0, 'club', 'dance', NULL);
INSERT INTO Post VALUES (10, 4, 'RECFEST', 'Join Duke Recreation & Physical Education for the biggest party on campus! This FREE carnival-style blowout event at Wilson Recreation Center has food, games, a live DJ, and apparel!', '2016-12-14 18:00:00', '2016-12-14 20:00:00', '2016-12-3 13:00:00', 2, 0, 'health', 'free', 'food');
INSERT INTO Post VALUES (11, 4, 'Walk up line open', 'Line is still short, come soon to get a spot for the game against GT tonight', '2016-12-14 18:00:00', '2016-12-14 20:00:00', '2016-12-3 13:00:00', 1, 0, 'psa', NULL, NULL);
INSERT INTO Post VALUES (12, 5, 'PUPPIES AT PERKINS', 'Forget about finals for awhile and come cuddle a puppy! Puppies at Perkins is tomorrow in Perkins 217.', '2016-12-14 14:00:00', '2016-12-14 16:00:00', '2016-12-3 13:00:00', 6, 0, 'psa', 'free', NULL);
INSERT INTO Post VALUES (13, 5, 'Study break', 'Free food in Perkins 215, come for healthy snacks and make your own stress ball', '2016-12-14 12:00:00', '2016-12-14 14:00:00', '2016-12-3 13:00:00', 1, 0, 'free', 'food', 'health');


