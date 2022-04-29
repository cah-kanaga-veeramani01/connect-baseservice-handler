CREATE OR REPLACE PROCEDURE attunityservice.sp_map_ServiceFromLegacyTIP() 
AS $$
DECLARE legacyTIPDetail RECORD;
DECLARE TIPTypeID INTEGER;
DECLARE serviceTypeID INTEGER;
DECLARE minDetail JSON;
DECLARE maxDetail JSON;
DECLARE createdBy INTEGER;
DECLARE updatedBy INTEGER;
DECLARE newServiceTagID INTEGER;
DECLARE legacyTIPType VARCHAR;

BEGIN

serviceTypeID = (SELECT "serviceTypeID" FROM service."ServiceType" WHERE "serviceType" = 'TIP');
FOR legacyTIPDetail IN (SELECT * ,CASE WHEN "active" is true THEN 1 ELSE 0 END as status FROM attunityservice."TipDetail")
LOOP

minDetail = (SELECT row_to_json(res.item) FROM (SELECT ("TIPDetailRuleID","activeasof") as item FROM attunityservice."TipDetailRule" WHERE tipdetailid = legacyTIPDetail."tipdetailid" AND 
			 "TIPDetailRuleID" = (SELECT MIN("TIPDetailRuleID") FROM attunityservice."TipDetailRule" WHERE tipdetailid = legacyTIPDetail."tipdetailid")) res);

maxDetail = (SELECT row_to_json(res.item) FROM (SELECT ("TIPDetailRuleID","activethru", "TIPTypeID", "activeasof") as item FROM attunityservice."TipDetailRule" WHERE tipdetailid = legacyTIPDetail."tipdetailid" and 
			 "TIPDetailRuleID" = (SELECT MAX("TIPDetailRuleID") FROM attunityservice."TipDetailRule" WHERE tipdetailid = legacyTIPDetail."tipdetailid")) res );

createdBy = (SELECT "createUserID" FROM attunityservice."TIPDetailRuleOverview" 
WHERE "TIPDetailRuleID" = (minDetail->>'f1')::INTEGER);

updatedBy = (SELECT "createUserID" FROM attunityservice."TIPDetailRuleOverview" 
WHERE "TIPDetailRuleID" = (maxDetail->>'f1')::INTEGER);

newServiceTagID = (SELECT "serviceTagID" FROM service."ServiceTag" WHERE "serviceTagName" = 
(SELECT "TipType" FROM attunityservice."TIPType" WHERE "TIPTypeID" = (maxDetail->>'f3')::INTEGER));

INSERT INTO service."Service" ("serviceName","serviceDisplayName", "globalServiceVersion", "serviceTypeID","validFrom", "validTill",
 "isPublished", "createdAt","createdBy","updatedAt", "updatedBy","legacyTIPDetailID")
VALUES(legacyTIPDetail."tiptitle", legacyTIPDetail."tiptitle", 1, serviceTypeID, (minDetail->>'f2')::timestamp, (maxDetail->>'f2')::timestamp, legacyTIPDetail."status",
	   legacyTIPDetail."createdate", createdBy, (maxDetail->>'f4')::timestamp,updatedBy, legacyTIPDetail."tipdetailid") ON CONFLICT DO NOTHING;

INSERT INTO service."ServiceTagMapping" ("serviceID", "serviceTagID", "globalServiceVersion", "createdBy", "updatedBy") VALUES ((SELECT MAX("serviceID") FROM service."Service"),newServiceTagID,1,createdBy, updatedBy) ON CONFLICT DO NOTHING;

END LOOP;
END 
$$
LANGUAGE 'plpgsql';

CALL attunityservice.sp_map_ServiceFromLegacyTIP();


SELECT setval('service."Service_serviceID_seq"', (SELECT MAX("serviceID") FROM service."Service"));  

SELECT setval('service."ServiceTagMapping_serviceTagMappingID_seq"', (SELECT MAX("serviceTagMappingID") FROM service."ServiceTagMapping"));  
