ALTER TABLE IF EXISTS service."Service"
ALTER COLUMN "isPublished" TYPE INTEGER USING "isPublished"::integer;