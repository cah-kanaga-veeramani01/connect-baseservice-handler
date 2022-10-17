TRUNCATE TABLE service."ServiceAttributes" CASCADE;

ALTER SEQUENCE service."ServiceAttributes_serviceAttributesID_seq" 
RESTART WITH 1;

CREATE OR REPLACE PROCEDURE attunityservice.sp_update_service_attributes() 
AS $$
DECLARE legacyTIPDetail RECORD;
DECLARE minDetail JSON;
DECLARE maxDetail JSON;
DECLARE createdBy INTEGER;
DECLARE attributes JSON;
DECLARE serviceID INTEGER;
DECLARE newServiceTypeID INTEGER;
BEGIN

FOR legacyTIPDetail IN (SELECT * ,CASE WHEN "active" is true THEN 1 ELSE 0 END as status FROM attunityservice."TipDetail")
LOOP
IF EXISTS (SELECT 1 FROM attunityservice."TipDetailRule" WHERE "tipdetailid" = legacyTIPDetail."tipdetailid")
THEN
minDetail = (SELECT row_to_json(res.item) FROM (SELECT ("TIPDetailRuleID","activeasof") as item FROM attunityservice."TipDetailRule" WHERE tipdetailid = legacyTIPDetail."tipdetailid" AND 
			 "TIPDetailRuleID" = (SELECT MIN("TIPDetailRuleID") FROM attunityservice."TipDetailRule" WHERE tipdetailid = legacyTIPDetail."tipdetailid")) res);

maxDetail = (SELECT row_to_json(res.item) FROM (SELECT ("TIPDetailRuleID","activethru", "TIPTypeID", "activeasof") as item FROM attunityservice."TipDetailRule" WHERE tipdetailid = legacyTIPDetail."tipdetailid" and 
			 "TIPDetailRuleID" = (SELECT MAX("TIPDetailRuleID") FROM attunityservice."TipDetailRule" WHERE tipdetailid = legacyTIPDetail."tipdetailid")) res );

createdBy = (SELECT "createUserID" FROM attunityservice."TIPDetailRuleOverview" 
WHERE "TIPDetailRuleID" = (minDetail->>'f1')::INTEGER);

newServiceTypeID = ((maxDetail->>'f3')::INTEGER);

attributes=(
SELECT
    json_build_object(
        'attributes', json_agg(newServiceTypeID)
    )
); 
IF EXISTS (SELECT 1 FROM service."Service" WHERE "legacyTIPDetailID" = legacyTIPDetail."tipdetailid")
THEN
serviceID = (SELECT "serviceID" FROM service."Service" WHERE "legacyTIPDetailID" = legacyTIPDetail."tipdetailid");
INSERT INTO service."ServiceAttributes" ("metadata", "serviceID", "globalServiceVersion","createdAt", "createdBy")
VALUES(attributes,serviceID, 1, legacyTIPDetail."createdate", createdBy);

END IF;

END IF;
END LOOP;
END 
$$
LANGUAGE 'plpgsql';

CALL attunityservice.sp_update_service_attributes();

SELECT setval('service."ServiceAttributes_serviceAttributesID_seq"', (SELECT MAX("serviceAttributesID") FROM service."ServiceAttributes"));  