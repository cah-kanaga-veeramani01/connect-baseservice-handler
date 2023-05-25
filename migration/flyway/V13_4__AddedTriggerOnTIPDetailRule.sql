CREATE OR REPLACE FUNCTION SERVICE_ATTRIBUTES_TRIGGER() RETURNS TRIGGER AS $$
DECLARE tipName VARCHAR;
DECLARE startDate TIMESTAMP;
DECLARE endDate TIMESTAMP := NULL;
DECLARE serviceID INTEGER;
DECLARE tipStatus INTEGER = 0;
DECLARE serviceTypeID INTEGER;
DECLARE attributesDt JSON;
DECLARE globalServiceVersion INTEGER;
BEGIN
IF (
   (
      select COUNT("tipdetailid")
      from attunityservice."TIPDetailRule"
      where "tipdetailid" = NEW."tipdetailid"
   ) = 1
) THEN -- insert

serviceTypeID = (
   SELECT "serviceTypeID"
   FROM service."ServiceType"
   WHERE "serviceType" = 'TIP'
);

attributesDt = (
   SELECT json_build_object('attributes', '[]'::JSON)
);

startDate = NEW."activeasof";

endDate = NEW."activethru";

IF ((NEW."active") = true)
 THEN tipStatus = 1;
END IF;

IF (tipStatus = 0)
 THEN endDate = NOW() - INTERVAL '1 DAY';
END IF;

tipName = (
   select "tiptitle"
   from attunityservice."TIPDetail"
   where "tipdetailid" = NEW."tipdetailid"
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
      NEW."tipdetailid"
   ) ON CONFLICT DO NOTHING
RETURNING "serviceID" INTO serviceID;
INSERT INTO service."ServiceAttributes" (
      "metadata",
      "serviceID",
      "globalServiceVersion",
      "createdAt"
   )
VALUES (attributesDt, serviceID, 1, NOW()) ON CONFLICT DO NOTHING;
END IF;
IF (
   (
      select COUNT("tipdetailid")
      from attunityservice."TIPDetailRule"
      where "tipdetailid" = NEW."tipdetailid"
   ) > 1
) THEN -- update

attributesDt = (
   SELECT json_build_object('attributes', '[]'::JSON)
);

startDate = NEW."activeasof";

endDate = NEW."activethru";

IF ((NEW."active") = true)
 THEN tipStatus = 1;
END IF;

IF (tipStatus = 0)
 THEN endDate = NOW() - INTERVAL '1 DAY';
END IF;

tipName = (
   select "tiptitle"
   from attunityservice."TIPDetail"
   where "tipdetailid" = NEW."tipdetailid"
);

UPDATE service."Service"
SET "serviceName" = tipName,
   "serviceDisplayName" = tipName,
   "validFrom" = startDate,
   "validTill" = endDate,
   "isPublished" = tipStatus,
   "updatedAt" = NOW()
WHERE ("legacyTIPDetailID" = NEW."tipdetailid")
RETURNING "serviceID" INTO serviceID;
UPDATE service."ServiceAttributes"
SET "metadata" = attributesDt,
   "updatedAt" = NOW()
WHERE ("serviceID" = serviceID);
END IF;
RETURN NEW;
END;
$$ LANGUAGE 'plpgsql';
DROP TRIGGER IF EXISTS SERVICE_ATTRIBUTES_TRIGGER ON "attunityservice"."TIPDetailRuleOverview";
CREATE TRIGGER SERVICE_ATTRIBUTES_TRIGGER
AFTER
INSERT ON "attunityservice"."TIPDetailRule" FOR EACH ROW EXECUTE PROCEDURE SERVICE_ATTRIBUTES_TRIGGER();