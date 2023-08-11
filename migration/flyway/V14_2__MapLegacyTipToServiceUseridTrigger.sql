CREATE OR REPLACE FUNCTION MAP_LEGACY_TIP_TO_SERVICE_USERID_TRIGGERV2() RETURNS TRIGGER AS $$
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
WHERE ("legacyTIPDetailID" = (SELECT "legacyTIPDetailID" FROM service."Service" 
WHERE (("validFrom" < now() AND "validTill" >= now()) OR ("validFrom" < now() AND "validTill" IS NULL) AND "isPublished" = 1 AND "legacyTIPDetailID" = tipID)))
RETURNING "serviceID" INTO serviceID;
UPDATE service."ServiceAttributes"
SET "updatedBy" = userID,
"updatedAt" = NOW()
WHERE ("serviceID" = serviceID);

RETURN NEW;
END;
$$ LANGUAGE 'plpgsql';
DROP TRIGGER IF EXISTS SERVICE_ATTRIBUTES_TRIGGER ON "attunityservice"."TIPDetailRuleOverview";
CREATE TRIGGER MAP_LEGACY_TIP_TO_SERVICE_USERID_TRIGGERV2
AFTER
INSERT ON "attunityservice"."TIPDetailRuleOverview" FOR EACH ROW EXECUTE PROCEDURE MAP_LEGACY_TIP_TO_SERVICE_USERID_TRIGGERV2();