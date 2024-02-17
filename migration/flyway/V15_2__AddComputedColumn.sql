CREATE FUNCTION service.isFutureDate(timestamp with time zone) RETURNS boolean
   LANGUAGE sql IMMUTABLE AS
$$SELECT CASE WHEN $1 > now()
            THEN true ELSE false
       END$$;
	   
CREATE FUNCTION service.isPastDate(timestamp with time zone) RETURNS boolean
   LANGUAGE sql IMMUTABLE AS
$$SELECT CASE WHEN $1 < now()
            THEN true ELSE false
       END$$;

-- Column: service."Service".status

-- ALTER TABLE IF EXISTS service."Service" DROP COLUMN IF EXISTS status;

ALTER TABLE IF EXISTS service."Service"
    ADD COLUMN status service."enum_Service_status" GENERATED ALWAYS AS (
CASE
    WHEN (("validFrom" IS NULL) AND ("validTill" IS NULL) AND ("isPublished" = 0)) THEN 'DRAFT'::service."enum_Service_status"
    WHEN (("validFrom" IS NOT NULL) AND service.ispastdate("validFrom") AND (("validTill" IS NULL) OR ( service.isfuturedate("validTill")) AND "validFrom" < "validTill") AND ("isPublished" = 1)) THEN 'ACTIVE'::service."enum_Service_status"
    WHEN (("validFrom" IS NOT NULL) AND service.isfuturedate("validFrom") AND (("validTill" IS NULL) OR ( service.isfuturedate("validTill")) AND "validFrom" < "validTill") AND ("isPublished" = 1)) THEN 'SCHEDULED'::service."enum_Service_status"
    WHEN (("validFrom" IS NOT NULL) AND ("validFrom" < "validTill") AND service.ispastdate("validTill")) THEN 'INACTIVE'::service."enum_Service_status"
    ELSE NULL
END) STORED;



CREATE INDEX "Service_serviceID_serviceName_legacyTIPDetailID" ON service."Service"
(
    "serviceID","serviceName","legacyTIPDetailID"
);