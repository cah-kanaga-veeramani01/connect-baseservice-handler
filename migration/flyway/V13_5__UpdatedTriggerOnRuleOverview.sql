CREATE OR REPLACE FUNCTION SERVICE_USERID_TRIGGER() RETURNS TRIGGER AS $$
DECLARE userID INTEGER;
DECLARE tipID INTEGER;
DECLARE serviceID INTEGER;
BEGIN
tipID = (
   SELECT "tipdetailid"
   from attunityservice."TIPDetailRule"
   where "TIPDetailRuleID" = NEW."TIPDetailRuleID"
);

UPDATE service."Service"
SET "updatedBy" = userID,
"updatedAt" = NOW()
WHERE ("legacyTIPDetailID" = tipID)
RETURNING "serviceID" INTO serviceID;
UPDATE service."ServiceAttributes"
SET "updatedBy" = userID,
"updatedAt" = NOW()
WHERE ("serviceID" = serviceID);

RETURN NEW;
END;
$$ LANGUAGE 'plpgsql';
DROP TRIGGER IF EXISTS SERVICE_ATTRIBUTES_TRIGGER ON "attunityservice"."TIPDetailRuleOverview";
CREATE TRIGGER SERVICE_USERID_TRIGGER
AFTER
INSERT ON "attunityservice"."TIPDetailRuleOverview" FOR EACH ROW EXECUTE PROCEDURE SERVICE_USERID_TRIGGER();