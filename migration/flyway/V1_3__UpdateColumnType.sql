ALTER TABLE service."Service"
ALTER COLUMN "isPublished" TYPE INTEGER USING "isPublished"::integer;