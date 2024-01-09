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


ALTER TABLE service."Service"
ADD COLUMN IF NOT EXISTS status service."enum_Service_status" 
GENERATED ALWAYS AS (CASE 
     WHEN "validFrom" is NULL and "validTill" is NULL and "isPublished" = 0 THEN 'DRAFT'::service."enum_Service_status" 
     WHEN "validFrom" is not NULL and service.isPastDate("validFrom")  and 
	( "validTill" is NULL  OR  service.isFutureDate("validTill"))  and "isPublished" = 1 THEN 'ACTIVE'::service."enum_Service_status" 
	 WHEN "validFrom" is not NULL and service.isFutureDate("validFrom") and
	 "isPublished" = 1 THEN  'SCHEDULED'::service."enum_Service_status" 
	 WHEN "validFrom" is not NULL and "validFrom" < "validTill" 
	 and service.isPastDate("validTill")  THEN  'INACTIVE'::service."enum_Service_status" 
     END) STORED