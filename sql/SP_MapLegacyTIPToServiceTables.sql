CREATE OR REPLACE PROCEDURE attunityservice.sp_map_ServiceFromLegacyTIP() 
AS $$
DECLARE legacyTIPDetail RECORD;
DECLARE TIPTypeID INTEGER;
DECLARE serviceTypeID INTEGER;
DECLARE minDetail JSON;
DECLARE maxDetail JSON;
DECLARE createdBy INTEGER;
DECLARE updatedBy INTEGER;
DECLARE newServiceID INTEGER;
DECLARE legacyTIPType VARCHAR;
DECLARE endDate TIMESTAMP := NULL;

BEGIN

serviceTypeID = (SELECT "serviceTypeID" FROM service."ServiceType" WHERE "serviceType" = 'TIP');
FOR legacyTIPDetail IN (SELECT * ,CASE WHEN "active" is true THEN 1 ELSE 0 END as status FROM attunityservice."TIPDetail")
LOOP
IF EXISTS (SELECT 1 FROM attunityservice."TIPDetailRule" WHERE "tipdetailid" = legacyTIPDetail."tipdetailid")
THEN
minDetail = (SELECT row_to_json(res.item) FROM (SELECT ("TIPDetailRuleID","activeasof") as item FROM attunityservice."TIPDetailRule" WHERE tipdetailid = legacyTIPDetail."tipdetailid" AND 
			 "TIPDetailRuleID" = (SELECT MIN("TIPDetailRuleID") FROM attunityservice."TIPDetailRule" WHERE tipdetailid = legacyTIPDetail."tipdetailid")) res);

maxDetail = (SELECT row_to_json(res.item) FROM (SELECT ("TIPDetailRuleID","activethru", "TIPTypeID", "activeasof") as item FROM attunityservice."TIPDetailRule" WHERE tipdetailid = legacyTIPDetail."tipdetailid" and 
			 "TIPDetailRuleID" = (SELECT MAX("TIPDetailRuleID") FROM attunityservice."TIPDetailRule" WHERE tipdetailid = legacyTIPDetail."tipdetailid")) res );

createdBy = (SELECT "createUserID" FROM attunityservice."TIPDetailRuleOverview" 
WHERE "TIPDetailRuleID" = (minDetail->>'f1')::INTEGER);

updatedBy = (SELECT "createUserID" FROM attunityservice."TIPDetailRuleOverview" 
WHERE "TIPDetailRuleID" = (maxDetail->>'f1')::INTEGER);
endDate = (maxDetail->>'f2')::timestamp;
IF (legacyTIPDetail."status" = 0) THEN endDate = NOW() - INTERVAL '1 DAY'; END IF;

INSERT INTO service."Service" ("serviceName","serviceDisplayName", "globalServiceVersion", "serviceTypeID","validFrom", "validTill",
 "isPublished", "createdAt","createdBy","updatedAt", "updatedBy","legacyTIPDetailID")
VALUES(legacyTIPDetail."tiptitle", legacyTIPDetail."tiptitle", 1, serviceTypeID, (minDetail->>'f2')::timestamp, endDate, legacyTIPDetail."status",
	   legacyTIPDetail."createdate", createdBy, (maxDetail->>'f4')::timestamp,updatedBy, legacyTIPDetail."tipdetailid") ON CONFLICT DO NOTHING RETURNING "serviceID" INTO newServiceID;

END IF;
END LOOP;
END 
$$
LANGUAGE 'plpgsql';