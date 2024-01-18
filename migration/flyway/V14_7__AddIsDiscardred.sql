ALTER TABLE IF EXISTS service."Service"
    ADD COLUMN IF NOT EXISTS "isDiscarded" integer NOT NULL DEFAULT 0;

CREATE OR replace PROCEDURE service.discard_service_draft(serviceids INT[])
AS
  $$
  DECLARE
  BEGIN
    RAISE notice 'Value: %',cardinality(serviceids);
    CASE
    WHEN (
        cardinality(serviceids)>0
      )
      THEN
      UPDATE service."Service"
      SET    "isDiscarded" = 1
      WHERE  "serviceID" = ANY(serviceids)
      AND    "status" = 'DRAFT';
    
    ELSE
      UPDATE service."Service"
      SET    "isDiscarded" = 1
      WHERE  "status" = 'DRAFT';
    
    END CASE;
    COMMIT;
  END $$ LANGUAGE plpgsql;

-- Will discard the drafts for the provided ServiceIDs 
-- CALL service.discard_service_draft(
-- 	ARRAY[826,1237,1238,1239,737,1240,393,1001]::INT[]
-- )

-- Will discard the drafts for all the services
-- CALL service.discard_service_draft(
-- 	ARRAY[]::INT[]
-- )
