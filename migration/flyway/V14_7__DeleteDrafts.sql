CREATE OR REPLACE PROCEDURE service.delete_service_drafts(ServiceIDs INT[])
AS
  $$
  DECLARE 
  i INT;
  BEGIN
    FOREACH i IN ARRAY ServiceIDs LOOP
    RAISE NOTICE '[%]', i;
	DELETE FROM service."ServiceAttributes" where "serviceID" = i AND "globalServiceVersion" = (SELECT "globalServiceVersion" FROM service."Service" where "serviceID" = i AND status = 'DRAFT');
	
    DELETE FROM service."ServiceModuleConfig" WHERE "serviceID" = i AND "moduleVersion" = (SELECT "globalServiceVersion" FROM service."Service" where "serviceID" = i AND status = 'DRAFT');

    DELETE FROM service."Service" where "serviceID" = i AND status = 'DRAFT';

    END LOOP; 
    COMMIT;
  END $$ LANGUAGE plpgsql;

-- Will delete the drafts for the provided ServiceIDs 
-- CALL service.delete_service_drafts(
-- 	ARRAY[826,1237,1238,1239,737,1240,393,1001]::INT[]
-- )

