export const QServiceList = (sortBy, sortOrder) => {
	return `SELECT * FROM (
		SELECT 
		  "Service"."serviceID", 
		  "Service"."serviceName",
	   	  "ServiceType"."serviceType",
		  JSONB_AGG(
			(
			  SELECT 
				X 
			  FROM 
				(
				  SELECT 
					"Service"."globalServiceVersion", 
					"Service"."validFrom", 
					"Service"."validTill", 
					"Service"."isPublished", 
					CASE WHEN (
					  (
						"Service"."validFrom" < now() 
						AND "Service"."validTill" >= now()
					  ) 
					  OR (
						"Service"."validFrom" < now() 
						AND "Service"."validTill" IS NULL
					  ) 
					  AND "Service"."isPublished" = 1
					) THEN 'ACTIVE' WHEN (
					  "Service"."validFrom" > now() 
					  AND "Service"."isPublished" = 1
					) THEN 'SCHEDULED' WHEN ("Service"."isPublished" = 0) THEN 'DRAFT' ELSE 'INACTIVE' END AS "status"
				) AS X
			)
		  ) AS "statuses" 
		FROM 
		  service."Service" 
 		  JOIN service."ServiceType" on "Service"."serviceTypeID" = "ServiceType"."serviceTypeID" 
		where 
		   "validTill" IS NULL 
		  OR "validTill" > NOW() 
		GROUP BY 
		  "Service"."serviceID", 
		  "Service"."serviceName",
	   	  "ServiceType"."serviceType"
	  ) ds
    
    WHERE ds."serviceName" ILIKE :searchKey
        OR ds."serviceID"::TEXT LIKE :searchKey
        OR ds."serviceType"::TEXT ILIKE :searchKey
    order by ds."${sortBy}" ${sortOrder}
    limit :limit offset :offset;`;
};

export const QServiceDetails = `SELECT
(SELECT "globalServiceVersion" FROM service."Service" WHERE "serviceID" = :serviceID AND "isPublished" = 1 AND ("validTill" IS NULL OR "validTill" >= NOW()) AND "validFrom" <= NOW()) AS "activeVersion",
(SELECT "globalServiceVersion" FROM service."Service" WHERE "serviceID" = :serviceID AND "isPublished" = 1 AND "validFrom" > NOW()) AS "scheduledVersion",
(SELECT "globalServiceVersion" FROM service."Service" WHERE "serviceID" = :serviceID AND "isPublished" = 0) AS "draftVersion";
`;

export const QCheckConfigCount = `SELECT count(*)
FROM service."ServiceModuleConfig" WHERE "serviceID" = :serviceID AND "moduleID" = :moduleID`;

export const QUpdateModuleConfig = `UPDATE service."ServiceModuleConfig"
SET "moduleVersion"= :moduleVersion
WHERE ("ServiceModuleConfig"."serviceID" = :serviceID AND "moduleID" = :moduleID);`;

export const QAddModuleConfig = `INSERT INTO service."ServiceModuleConfig"(
	"serviceID", "moduleID", "moduleVersion", status)
	VALUES (:serviceID, :moduleID, :moduleVersion, null)`;

export const QServiceActiveVersion =
	'SELECT "globalServiceVersion" FROM service."Service" WHERE "serviceID" = :serviceID AND "isPublished" = 1 AND ("validTill" IS NULL OR "validTill" >= NOW()) AND "validFrom" <= NOW();';
