CREATE OR REPLACE FUNCTION EXPIRE_TIP() RETURNS TRIGGER AS $$
DECLARE endDate TIMESTAMP := NULL;
DECLARE tipStatus INTEGER = 0;
BEGIN
IF(TG_OP = 'UPDATE')
THEN

IF (NEW."active" = true)
THEN
tipStatus = 1;
END IF;
endDate = NEW."activethru";

UPDATE
   service."Service"
SET
   "validTill" = endDate,
   "isPublished" = tipStatus,
   "updatedAt" = NOW()
WHERE
    ( "legacyTIPDetailID" = NEW."tipdetailid" );

END IF;
RETURN NEW;
END;
$$ LANGUAGE 'plpgsql';

DROP TRIGGER IF EXISTS EXPIRE_TIP
ON "attunityservice"."TIPDetailRule";

CREATE TRIGGER EXPIRE_TIP 
AFTER UPDATE ON "attunityservice"."TIPDetailRule"
FOR EACH ROW
EXECUTE PROCEDURE EXPIRE_TIP();