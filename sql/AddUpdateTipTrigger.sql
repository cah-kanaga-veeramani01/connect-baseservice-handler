CREATE OR REPLACE FUNCTION ADD_UPDATE_TIP() RETURNS TRIGGER AS $$
DECLARE tipName VARCHAR;
DECLARE userID INTEGER;
DECLARE startDate TIMESTAMP;
DECLARE endDate TIMESTAMP := NULL;
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
startDate = (select "activeasof" from attunityservice."TIPDetailRule" where "TIPDetailRuleID" = NEW."TIPDetailRuleID");
endDate = (select "activethru" from attunityservice."TIPDetailRule" where "TIPDetailRuleID" = NEW."TIPDetailRuleID");
serviceTypeID = (SELECT "serviceTypeID" FROM service."ServiceType" WHERE "serviceType" = 'TIP');
tipName = (select "tiptitle" from attunityservice."TIPDetail" where "tipdetailid" = tipID);

IF ((select "active" from attunityservice."TIPDetailRule" where "TIPDetailRuleID" = NEW."TIPDetailRuleID") = true)
THEN
tipStatus = 1;
END IF;
userID = NEW."createUserID";


INSERT INTO service."Service"(
 	"serviceName", "serviceDisplayName", "globalServiceVersion", "validFrom", "validTill", "isPublished", "serviceTypeID", "createdAt", "createdBy", "legacyTIPDetailID")
 	VALUES (tipName, tipName, 1, startDate, endDate, tipStatus, serviceTypeID, NOW(), userID, tipID) ON CONFLICT DO NOTHING RETURNING "serviceID" INTO serviceID;
	
END IF;

IF ((select COUNT(*) from attunityservice."TIPDetailRule" where "tipdetailid" = tipID) > 1) THEN
-- update
startDate = (select "activeasof" from attunityservice."TIPDetailRule" where "TIPDetailRuleID" = NEW."TIPDetailRuleID");
endDate = (select "activethru" from attunityservice."TIPDetailRule" where "TIPDetailRuleID" = NEW."TIPDetailRuleID");
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

END IF;

END IF;
RETURN NEW;
END;
$$ LANGUAGE 'plpgsql';