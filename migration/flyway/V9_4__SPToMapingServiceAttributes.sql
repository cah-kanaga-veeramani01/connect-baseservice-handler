TRUNCATE TABLE service."ServiceAttributes" CASCADE;
ALTER SEQUENCE service."ServiceAttributes_serviceAttributesID_seq" RESTART WITH 1;
CREATE 
OR REPLACE PROCEDURE attunityservice.sp_update_service_attributes() AS $$ DECLARE legacyTIPDetail RECORD;
DECLARE minDetail JSON;
DECLARE maxDetail JSON;
DECLARE createdBy INTEGER;
DECLARE attributes JSON;
DECLARE serviceID INTEGER;
DECLARE globalServiceVersion INTEGER;
DECLARE newServiceTypeID INTEGER;
DECLARE serviceRecord JSON;
BEGIN FOR legacyTIPDetail IN (
  SELECT 
    *, 
    CASE WHEN "active" is true THEN 1 ELSE 0 END as status 
  FROM 
    attunityservice."TIPDetail"
) LOOP IF EXISTS (
  SELECT 
    1 
  FROM 
    attunityservice."TIPDetailRule" 
  WHERE 
    "tipdetailid" = legacyTIPDetail."tipdetailid"
) THEN minDetail = (
  SELECT 
    row_to_json(res.item) 
  FROM 
    (
      SELECT 
        ("TIPDetailRuleID", "activeasof") as item 
      FROM 
        attunityservice."TIPDetailRule" 
      WHERE 
        tipdetailid = legacyTIPDetail."tipdetailid" 
        AND "TIPDetailRuleID" = (
          SELECT 
            MIN("TIPDetailRuleID") 
          FROM 
            attunityservice."TIPDetailRule" 
          WHERE 
            tipdetailid = legacyTIPDetail."tipdetailid"
        )
    ) res
);
maxDetail = (
  SELECT 
    row_to_json(res.item) 
  FROM 
    (
      SELECT 
        (
          "TIPDetailRuleID", "activethru", 
          "TIPTypeID", "activeasof"
        ) as item 
      FROM 
        attunityservice."TIPDetailRule" 
      WHERE 
        tipdetailid = legacyTIPDetail."tipdetailid" 
        and "TIPDetailRuleID" = (
          SELECT 
            MAX("TIPDetailRuleID") 
          FROM 
            attunityservice."TIPDetailRule" 
          WHERE 
            tipdetailid = legacyTIPDetail."tipdetailid"
        )
    ) res
);
createdBy = (
  SELECT 
    "createUserID" 
  FROM 
    attunityservice."TIPDetailRuleOverview" 
  WHERE 
    "TIPDetailRuleID" = (minDetail ->> 'f1'):: INTEGER
);
newServiceTypeID = (
  (maxDetail ->> 'f3'):: INTEGER
);
attributes =(
  SELECT 
    json_build_object(
      'attributes', 
      json_agg(newServiceTypeID)
    )
);
IF (
  select 
    1 
  from 
    service."Service" 
  where 
    (
      (
        "Service"."validFrom" < now() 
        AND "Service"."validTill" >= now()
      ) 
      OR (
        "Service"."validFrom" < now() 
        AND "Service"."validTill" IS NULL
      )
    ) 
    AND "Service"."isPublished" = 1 
    and "legacyTIPDetailID" = legacyTIPDetail."tipdetailid" 
  limit 
    1
) THEN serviceRecord = (
  select 
    row_to_json(ress.item) 
  from 
    (
      select 
        (
          "serviceID", "globalServiceVersion", 
          "Service"."validFrom", "Service"."validTill", 
          "Service"."isPublished", "legacyTIPDetailID"
        ) as item 
      from 
        service."Service" 
      where 
        (
          (
            "Service"."validFrom" < now() 
            AND "Service"."validTill" >= now()
          ) 
          OR (
            "Service"."validFrom" < now() 
            AND "Service"."validTill" IS NULL
          )
        ) 
        AND "Service"."isPublished" = 1 
        and "legacyTIPDetailID" = legacyTIPDetail."tipdetailid" 
      limit 
        1
    ) ress
);
serviceID = (serviceRecord ->> 'f1'):: INTEGER;
globalServiceVersion = (serviceRecord ->> 'f2'):: INTEGER;
INSERT INTO service."ServiceAttributes" (
  "metadata", "serviceID", "globalServiceVersion", 
  "createdAt", "createdBy"
) 
VALUES 
  (
    attributes, serviceID, globalServiceVersion, 
    legacyTIPDetail."createdate", createdBy
  );
END IF;
END IF;
END LOOP;
END $$ LANGUAGE 'plpgsql';
CALL attunityservice.sp_update_service_attributes();
SELECT 
  setval(
    'service."ServiceAttributes_serviceAttributesID_seq"', 
    (
      SELECT 
        MAX("serviceAttributesID") 
      FROM 
        service."ServiceAttributes"
    )
  );