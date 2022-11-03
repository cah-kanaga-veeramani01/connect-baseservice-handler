CREATE OR REPLACE FUNCTION SERVICE_ATTRIBUTES_TRIGGER() RETURNS TRIGGER AS $$
DECLARE tipName VARCHAR;
DECLARE userID INTEGER;
DECLARE startDate TIMESTAMP;
DECLARE endDate TIMESTAMP := NULL;
DECLARE serviceID INTEGER;
DECLARE tipStatus INTEGER = 0;
DECLARE serviceTypeID INTEGER;
DECLARE tipID INTEGER;
DECLARE attributes JSON;
DECLARE globalServiceVersion INTEGER;
BEGIN
IF(TG_OP = 'INSERT')
THEN

tipID = (SELECT "tipdetailid" from attunityservice."TipDetailRule" where "TIPDetailRuleID" = NEW."TIPDetailRuleID");
IF ((select COUNT(*) from attunityservice."TipDetailRule" where "tipdetailid" = tipID) = 1) THEN
-- insert
startDate = (select "activeasof" from attunityservice."TipDetailRule" where "TIPDetailRuleID" = NEW."TIPDetailRuleID");
endDate = (select "activethru" from attunityservice."TipDetailRule" where "TIPDetailRuleID" = NEW."TIPDetailRuleID");
serviceTypeID = (SELECT "serviceTypeID" FROM service."ServiceType" WHERE "serviceType" = 'TIP');
tipName = (select "tiptitle" from attunityservice."TipDetail" where "tipdetailid" = tipID);

attributes = SELECT json_build_object('attributes', 
 json_agg("TIPTypeID"))FROM  attunityservice."TipDetailRule" where  "TIPDetailRuleID" = NEW."TIPDetailRuleID";



IF ((select "active" from attunityservice."TipDetailRule" where "TIPDetailRuleID" = NEW."TIPDetailRuleID") = true)
THEN
tipStatus = 1;
END IF;
userID = NEW."createUserID";


INSERT INTO service."Service"(
 	"serviceName", "serviceDisplayName", "globalServiceVersion", "validFrom", "validTill", "isPublished", "serviceTypeID", "createdAt", "createdBy", "legacyTIPDetailID")
 	VALUES (tipName, tipName, 1, startDate, endDate, tipStatus, serviceTypeID, NOW(), userID, tipID) ON CONFLICT DO NOTHING RETURNING "serviceID" INTO serviceID;
	
INSERT INTO service."ServiceAttributes" (
  "metadata", "serviceID", "globalServiceVersion", "createdAt", "createdBy") 
VALUES ( attributes, serviceID, 1, NOW(), userID) ON CONFLICT DO NOTHING;
END IF;

IF ((select COUNT(*) from attunityservice."TipDetailRule" where "tipdetailid" = tipID) > 1) THEN
-- update
startDate = (select "activeasof" from attunityservice."TipDetailRule" where "TIPDetailRuleID" = NEW."TIPDetailRuleID");
endDate = (select "activethru" from attunityservice."TipDetailRule" where "TIPDetailRuleID" = NEW."TIPDetailRuleID");
tipName = (select "tiptitle" from attunityservice."TipDetail" where "tipdetailid" = tipID);

IF ((select "active" from attunityservice."TipDetailRule" where "TIPDetailRuleID" = NEW."TIPDetailRuleID") = true)
THEN
tipStatus = 1;
END IF;
userID = NEW."createUserID";

attributes = SELECT json_build_object('attributes', 
 json_agg("TIPTypeID"))FROM  attunityservice."TipDetailRule" where  "TIPDetailRuleID" = NEW."TIPDetailRuleID";

UPDATE
   service."Service"
SET
   "serviceName" = tipName,
   "serviceDisplayName" = tipName,
   "validFrom" = startDate,
   "validTill" = endDate,
   "isPublished" = tipStatus,
   "updatedAt" = NOW(),
   "updatedBy" = userID
WHERE
    ( "legacyTIPDetailID" = tipID ) RETURNING "serviceID" INTO serviceID;

UPDATE
    service."ServiceAttributes"
SET
   "metadata"= attributes,
   "updatedAt" = NOW(),
   "updatedBy" = userID
WHERE
   ( "serviceID" = serviceID );

END IF;

END IF;
RETURN NEW;
END;
$$ LANGUAGE 'plpgsql';

DROP TRIGGER IF EXISTS SERVICE_ATTRIBUTES_TRIGGER
ON "attunityservice"."TIPDetailRuleOverview";

CREATE TRIGGER SERVICE_ATTRIBUTES_TRIGGER 
AFTER INSERT ON "attunityservice"."TIPDetailRuleOverview"
FOR EACH ROW
EXECUTE PROCEDURE SERVICE_ATTRIBUTES_TRIGGER();