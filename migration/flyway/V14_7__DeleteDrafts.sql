CREATE OR replace PROCEDURE service.delete_service_drafts(ServiceIDs INT[])
AS
  $$
  DECLARE i INT;
  DECLARE draftVersion INT;
  BEGIN
	foreach i IN ARRAY ServiceIDs
    LOOP
      RAISE notice 'serviceID %', i;
	  
	  draftVersion = (SELECT "globalServiceVersion"  FROM service."Service" WHERE "serviceID" = i AND "validFrom" IS NULL AND "validTill" IS NULL AND "isPublished" = 0);
      RAISE notice 'draftVersion %', draftVersion;
	  
	  DELETE
      FROM   service."ServiceAttributes"
      WHERE  "serviceID" = i
      AND    "globalServiceVersion" = draftVersion;
            
      DELETE
      FROM   service."ServiceModuleConfig"
      WHERE  "serviceID" = i
      AND    "moduleVersion" = draftVersion;
      
      DELETE
      FROM   service."Service"
      WHERE  "serviceID" = i
      AND    "globalServiceVersion" = draftVersion;
    
    END LOOP;
    COMMIT;
  END $$ LANGUAGE plpgsql;

-- Will delete the drafts for the provided ServiceIDs 
-- CALL service.delete_service_drafts(
-- 	ARRAY[826,1237,1238,1239,737,1240,393,1001]::INT[]
-- )

