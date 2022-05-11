CREATE OR REPLACE FUNCTION UPDATE_TIP() RETURNS TRIGGER AS $$
DECLARE tipName VARCHAR;
DECLARE userID INTEGER;
DECLARE serviceTagID INTEGER;
DECLARE startDate TIMESTAMP;
DECLARE endDate TIMESTAMP := NULL;
DECLARE newServiceTagID INTEGER;
DECLARE serviceID INTEGER;
DECLARE tipStatus INTEGER = 0;
BEGIN
IF(TG_OP = 'INSERT')
THEN

IF ((select COUNT(*) from attunityservice."TipDetailRule" where tipdetailid = NEW."tipdetailid") > 1) THEN

tipName = (select "tiptitle" from attunityservice."TipDetail" where tipdetailid = NEW."tipdetailid");
userID = (select "createUserID" from attunityservice."TIPDetailRuleOverview" where "TIPDetailRuleID" = NEW."TIPDetailRuleID");
serviceTagID = NEW."TIPTypeID";
startDate = NEW."activeasof";
endDate = NEW."activethru";
newServiceTagID = (SELECT "serviceTagID" FROM service."ServiceTag" WHERE "serviceTagName" = (SELECT "TipType" FROM attunityservice."TIPType" WHERE "TIPTypeID" = serviceTagID));

IF (NEW.active = true)
THEN
tipStatus = 1;
END IF;

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
    ( "legacyTIPDetailID" = NEW."tipdetailid" ) RETURNING "serviceID" INTO serviceID;

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

DROP TRIGGER IF EXISTS UPDATE_TIP
ON "attunityservice"."TipDetailRule";

CREATE TRIGGER UPDATE_TIP 
AFTER INSERT ON "attunityservice"."TipDetailRule"
FOR EACH ROW
EXECUTE PROCEDURE UPDATE_TIP();