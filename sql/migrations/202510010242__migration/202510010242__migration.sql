ALTER TABLE communities 
ADD COLUMN tagname varchar[] NOT NULL DEFAULT '{}';