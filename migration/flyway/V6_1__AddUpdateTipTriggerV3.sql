CREATE OR REPLACE FUNCTION ADD_UPDATE_TIP() RETURNS TRIGGER AS $$
DECLARE tipName VARCHAR;
DECLARE userID INTEGER;
DECLARE serviceTagID INTEGER;
DECLARE startDate TIMESTAMP;
DECLARE endDate TIMESTAMP := NULL;
DECLARE newServiceTagID INTEGER;
DECLARE serviceID INTEGER;
DECLARE tipStatus INTEGER = 0;
DECLARE serviceTypeID INTEGER;
DECLARE tipID INTEGER;
BEGIN
IF(TG_OP = 'INSERT')
THEN

tipID = (SELECT "tipdetailid" from attunityservice."TIPDetailRule" where "TIPDetailRuleID" = NEW."TIPDetailRuleID");
IF ((select COUNT(*) from attunityservice."TIPDetailRule" where "tipdetailid" = tipID) = 1) THEN
-- insert
serviceTagID = (select "TIPTypeID" from attunityservice."TIPDetailRule" where "TIPDetailRuleID" =  NEW."TIPDetailRuleID");
startDate = (select "activeasof" from attunityservice."TIPDetailRule" where "TIPDetailRuleID" = NEW."TIPDetailRuleID");
endDate = (select "activethru" from attunityservice."TIPDetailRule" where "TIPDetailRuleID" = NEW."TIPDetailRuleID");
serviceTypeID = (SELECT "serviceTypeID" FROM service."ServiceType" WHERE "serviceType" = 'TIP');
newServiceTagID = (SELECT "serviceTagID" FROM service."ServiceTag" WHERE "serviceTagName" = (SELECT "TipType" FROM attunityservice."TIPType" WHERE "TIPTypeID" = serviceTagID));
tipName = (select "tiptitle" from attunityservice."TIPDetail" where "tipdetailid" = tipID);

IF ((select "active" from attunityservice."TIPDetailRule" where "TIPDetailRuleID" = NEW."TIPDetailRuleID") = true)
THEN
tipStatus = 1;
END IF;
userID = NEW."createUserID";


INSERT INTO service."Service"(
 	"serviceName", "serviceDisplayName", "globalServiceVersion", "validFrom", "validTill", "isPublished", "serviceTypeID", "createdAt", "createdBy", "legacyTIPDetailID")
 	VALUES (tipName, tipName, 1, startDate, endDate, tipStatus, serviceTypeID, NOW(), userID, tipID) ON CONFLICT DO NOTHING RETURNING "serviceID" INTO serviceID;
	
INSERT INTO service."ServiceTagMapping"(
	"serviceID", "globalServiceVersion", "serviceTagID", "createdAt", "createdBy")
	VALUES (serviceID, 1, newServiceTagID, NOW(), userID) ON CONFLICT DO NOTHING;
END IF;

IF ((select COUNT(*) from attunityservice."TIPDetailRule" where "tipdetailid" = tipID) > 1) THEN
-- update
serviceTagID = (select "TIPTypeID" from attunityservice."TIPDetailRule" where "TIPDetailRuleID" =  NEW."TIPDetailRuleID");
startDate = (select "activeasof" from attunityservice."TIPDetailRule" where "TIPDetailRuleID" = NEW."TIPDetailRuleID");
endDate = (select "activethru" from attunityservice."TIPDetailRule" where "TIPDetailRuleID" = NEW."TIPDetailRuleID");
newServiceTagID = (SELECT "serviceTagID" FROM service."ServiceTag" WHERE "serviceTagName" = (SELECT "TipType" FROM attunityservice."TIPType" WHERE "TIPTypeID" = serviceTagID));
tipName = (select "tiptitle" from attunityservice."TIPDetail" where "tipdetailid" = tipID);

IF ((select "active" from attunityservice."TIPDetailRule" where "TIPDetailRuleID" = NEW."TIPDetailRuleID") = true)
THEN
tipStatus = 1;
END IF;
userID = NEW."createUserID";


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
    service."ServiceTagMapping"
SET
   "serviceTagID"= newServiceTagID,
   "updatedAt" = NOW(),
   "updatedBy" = userID
WHERE
    ( "serviceID" = serviceID );

END IF;

END IF;
RETURN NEW;
END;
$$ LANGUAGE 'plpgsql';

DROP TRIGGER IF EXISTS ADD_UPDATE_TIP
ON "attunityservice"."TIPDetailRuleOverview";

CREATE TRIGGER ADD_UPDATE_TIP 
AFTER INSERT ON "attunityservice"."TIPDetailRuleOverview"
FOR EACH ROW
EXECUTE PROCEDURE ADD_UPDATE_TIP();