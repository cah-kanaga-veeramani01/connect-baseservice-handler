CREATE OR REPLACE FUNCTION SERVICE_ATTRIBUTES_TRIGGER() RETURNS TRIGGER AS $$
DECLARE tipName VARCHAR;
DECLARE userID INTEGER;
DECLARE startDate TIMESTAMP;
DECLARE endDate TIMESTAMP := NULL;
DECLARE serviceID INTEGER;
DECLARE tipStatus INTEGER = 0;
DECLARE serviceTypeID INTEGER;
DECLARE tipID INTEGER;
DECLARE attributesDt JSON;
DECLARE globalServiceVersion INTEGER;
BEGIN IF(TG_OP = 'INSERT') THEN tipID = (
   SELECT "tipdetailid"
   from attunityservice."TIPDetailRule"
   where "TIPDetailRuleID" = NEW."TIPDetailRuleID"
);
IF (
   (
      select COUNT(*)
      from attunityservice."TIPDetailRule"
      where "tipdetailid" = tipID
   ) = 1
) THEN -- insert
startDate = (
   select "activeasof"
   from attunityservice."TIPDetailRule"
   where "TIPDetailRuleID" = NEW."TIPDetailRuleID"
);
endDate = (
   select "activethru"
   from attunityservice."TIPDetailRule"
   where "TIPDetailRuleID" = NEW."TIPDetailRuleID"
);
serviceTypeID = (
   SELECT "serviceTypeID"
   FROM service."ServiceType"
   WHERE "serviceType" = 'TIP'
);
attributesDt = (
   SELECT json_build_object('attributes', '[]'::JSON)
);
IF (
(select "active" from attunityservice."TIPDetailRule" where "TIPDetailRuleID" = NEW."TIPDetailRuleID") = true
) THEN tipStatus = 1;
END IF;

IF (tipStatus = 0) THEN endDate = NOW() - INTERVAL '1 DAY'; END IF;

userID = NEW."createUserID";
tipName = (
   select "tiptitle"
   from attunityservice."TIPDetail"
   where "tipdetailid" = tipID
);
INSERT INTO service."Service"(
      "serviceName",
      "serviceDisplayName",
      "globalServiceVersion",
      "validFrom",
      "validTill",
      "isPublished",
      "serviceTypeID",
      "createdAt",
      "createdBy",
      "legacyTIPDetailID"
   )
VALUES (
      tipName,
      tipName,
      1,
      startDate,
      endDate,
      tipStatus,
      serviceTypeID,
      NOW(),
      userID,
      tipID
   ) ON CONFLICT DO NOTHING
RETURNING "serviceID" INTO serviceID;
INSERT INTO service."ServiceAttributes" (
      "metadata",
      "serviceID",
      "globalServiceVersion",
      "createdAt",
      "createdBy"
   )
VALUES (attributesDt, serviceID, 1, NOW(), userID) ON CONFLICT DO NOTHING;
END IF;
IF (
   (
      select COUNT(*)
      from attunityservice."TIPDetailRule"
      where "tipdetailid" = tipID
   ) > 1
) THEN -- update
startDate = (
   select "activeasof"
   from attunityservice."TIPDetailRule"
   where "TIPDetailRuleID" = NEW."TIPDetailRuleID"
);
endDate = (
   select "activethru"
   from attunityservice."TIPDetailRule"
   where "TIPDetailRuleID" = NEW."TIPDetailRuleID"
);
IF (
(select "active" from attunityservice."TIPDetailRule" where "TIPDetailRuleID" = NEW."TIPDetailRuleID") = true
) THEN tipStatus = 1;
END IF;

IF (tipStatus = 0) THEN endDate = NOW() - INTERVAL '1 DAY'; END IF;

userID = NEW."createUserID";
attributesDt = (
   SELECT json_build_object('attributes', '[]'::JSON)
);

PERFORM pg_sleep(0.5);
tipName = (
   select "tiptitle"
   from attunityservice."TIPDetail"
   where "tipdetailid" = tipID
);
UPDATE service."Service"
SET "serviceName" = tipName,
   "serviceDisplayName" = tipName,
   "validFrom" = startDate,
   "validTill" = endDate,
   "isPublished" = tipStatus,
   "updatedAt" = NOW(),
   "updatedBy" = userID
WHERE ("legacyTIPDetailID" = tipID)
RETURNING "serviceID" INTO serviceID;
UPDATE service."ServiceAttributes"
SET "metadata" = attributesDt,
   "updatedAt" = NOW(),
   "updatedBy" = userID
WHERE ("serviceID" = serviceID);
END IF;
END IF;
RETURN NEW;
END;
$$ LANGUAGE 'plpgsql';
DROP TRIGGER IF EXISTS SERVICE_ATTRIBUTES_TRIGGER ON "attunityservice"."TIPDetailRuleOverview";
CREATE TRIGGER SERVICE_ATTRIBUTES_TRIGGER
AFTER
INSERT ON "attunityservice"."TIPDetailRuleOverview" FOR EACH ROW EXECUTE PROCEDURE SERVICE_ATTRIBUTES_TRIGGER();