CREATE OR REPLACE FUNCTION ADD_TIP() RETURNS TRIGGER AS $$
DECLARE thisisPK INTEGER;
DECLARE userID INTEGER;
DECLARE serviceTagID INTEGER;
DECLARE startDate TIMESTAMP;
DECLARE endDate TIMESTAMP := NULL;
DECLARE serviceTypeID INTEGER;
DECLARE newServiceTagID INTEGER;
DECLARE serviceID INTEGER;
DECLARE tipStatus INTEGER = 0;
BEGIN
IF (TG_OP = 'INSERT') 
THEN

thisisPK = (select "TIPDetailRuleID" from attunityservice."TIPDetailRule" where tipdetailid = NEW."tipdetailid" ORDER BY "activeasof" DESC LIMIT 1);
userID = (select "createUserID" from attunityservice."TIPDetailRuleOverview" where "TIPDetailRuleID" = thisisPK);
serviceTagID = (select "TIPTypeID" from attunityservice."TIPDetailRule" where "TIPDetailRuleID" = thisisPK);
startDate = (select "activeasof" from attunityservice."TIPDetailRule" where "TIPDetailRuleID" = thisisPK);
endDate = (select "activethru" from attunityservice."TIPDetailRule" where "TIPDetailRuleID" = thisisPK);
serviceTypeID = (SELECT "serviceTypeID" FROM service."ServiceType" WHERE "serviceType" = 'TIP');
newServiceTagID = (SELECT "serviceTagID" FROM service."ServiceTag" WHERE "serviceTagName" = (SELECT "TipType" FROM attunityservice."TIPType" WHERE "TIPTypeID" = serviceTagID));

IF (NEW.active = true)
THEN
tipStatus = 1;
END IF;

INSERT INTO service."Service"(
 	"serviceName", "serviceDisplayName", "globalServiceVersion", "validFrom", "validTill", "isPublished", "serviceTypeID", "createdAt", "createdBy", "legacyTIPDetailID")
 	VALUES (NEW.tiptitle, NEW.tiptitle, 1, startDate, endDate, tipStatus, serviceTypeID, NOW(), userID, NEW.tipdetailid) ON CONFLICT DO NOTHING RETURNING "serviceID" INTO serviceID;
	
INSERT INTO service."ServiceTagMapping"(
	"serviceID", "globalServiceVersion", "serviceTagID", "createdAt", "createdBy")
	VALUES (serviceID, 1, newServiceTagID, NOW(), userID) ON CONFLICT DO NOTHING;

END IF;
RETURN NEW;
END;
$$ LANGUAGE 'plpgsql';

DROP TRIGGER IF EXISTS ADD_TIP
ON "attunityservice"."TIPDetail";

CREATE TRIGGER ADD_TIP 
AFTER INSERT OR UPDATE ON "attunityservice"."TIPDetail"
FOR EACH ROW
EXECUTE PROCEDURE ADD_TIP();