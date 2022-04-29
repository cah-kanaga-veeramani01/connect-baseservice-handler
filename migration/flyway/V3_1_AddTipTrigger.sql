CREATE OR REPLACE FUNCTION ADD_TIP() RETURNS TRIGGER AS $$
DECLARE thisisPK INTEGER;
DECLARE userID INTEGER;
DECLARE serviceTagID INTEGER;
DECLARE startDate TIMESTAMP;
DECLARE endDate TIMESTAMP := NULL;
-- DECLARE expirationDays INTEGER;
-- DECLARE expirationType VARCHAR;
DECLARE serviceID INTEGER;
BEGIN
IF (TG_OP = 'INSERT') 
THEN

thisisPK = (select "TIPDetailRuleID" from attunityservice."TipDetailRule" where detailid = NEW."tipdetailid" ORDER BY "activeasof" DESC LIMIT 1);
userID = (select "createUserID" from attunityservice."TIPDetailRuleOverview" where "TIPDetailRuleID" = thisisPK);
serviceTagID = (select "TIPTypeID" from attunityservice."TipDetailRule" where "TIPDetailRuleID" = thisisPK);
startDate = (select "activeasof" from attunityservice."TipDetailRule" where "TIPDetailRuleID" = thisisPK);
endDate = (select "activethru" from attunityservice."TipDetailRule" where "TIPDetailRuleID" = thisisPK);
-- expirationType = (select "expirationtype" from attunityservice."TIPDetailRule" where "TIPDetailRuleID" = thisisPK);
-- expirationDays = (select "expirationdays" from attunityservice."TIPDetailRule" where "TIPDetailRuleID" = thisisPK);

INSERT INTO service."Service"(
 	"serviceName", "serviceDisplayName", "globalServiceVersion", "validFrom", "validTill", "isPublished", "serviceTypeID", "createdAt", "createdBy", "legacyTipDetailID")
 	VALUES (NEW.title, NEW.title, 1, startDate, endDate, NEW.active, 1, NOW(), userID, NEW.tipdetailid) ON CONFLICT DO NOTHING RETURNING "serviceID" INTO serviceID;
	
INSERT INTO service."ServiceTagMapping"(
	"serviceID", "globalServiceVersion", "serviceTagID", "createdAt", "createdBy")
	VALUES (serviceID, 1, serviceTagID, NOW(), userID) ON CONFLICT DO NOTHING;

END IF;
RETURN NEW;
END;
$$ LANGUAGE 'plpgsql';

DROP TRIGGER IF EXISTS ADD_TIP
ON "attunityservice"."TipDetail";

CREATE TRIGGER ADD_TIP 
AFTER INSERT OR UPDATE ON "attunityservice"."TipDetail"
FOR EACH ROW
EXECUTE PROCEDURE ADD_UPDATE_TIP();