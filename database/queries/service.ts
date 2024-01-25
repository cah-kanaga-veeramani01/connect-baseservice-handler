export const QServiceList = (sortBy, sortOrder) => {
	return `select * from (select 

 case 
 when (vs.statuses->0->>'status')::text='ACTIVE' then (vs.statuses->0->>'serviceName')::text 
 when ((vs.statuses->0->>'status')::text='DRAFT' AND (vs.statuses->1->>'status')::text='ACTIVE') then (vs.statuses->1->>'serviceName')::text 
 when (vs.statuses->0->>'status')::text='DRAFT' then (vs.statuses->0->>'serviceName')::text 
 when ((vs.statuses->0->>'status')::text='SCHEDULED' AND (vs.statuses->1->>'status')::text='ACTIVE') then (vs.statuses->1->>'serviceName')::text 
 when (vs.statuses->0->>'status')::text='SCHEDULED' then (vs.statuses->0->>'serviceName')::text 
 else (vs.statuses->1->>'serviceName')::text end as servicename,
 case 
 when (vs.statuses->0->>'status')::text='ACTIVE' then (vs.statuses->0->>'serviceType')::text 
 when ((vs.statuses->0->>'status')::text='DRAFT' AND (vs.statuses->1->>'status')::text='ACTIVE') then (vs.statuses->1->>'serviceType')::text 
 when (vs.statuses->0->>'status')::text='DRAFT' then (vs.statuses->0->>'serviceType')::text 
 when ((vs.statuses->0->>'status')::text='SCHEDULED' AND (vs.statuses->1->>'status')::text='ACTIVE') then (vs.statuses->1->>'serviceType')::text 
 when (vs.statuses->0->>'status')::text='SCHEDULED' then (vs.statuses->0->>'serviceType')::text 
 else (vs.statuses->1->>'serviceType')::text end as serviceType,
 case 
 when (vs.statuses->0->>'status')::text='ACTIVE' then (vs.statuses->0->>'legacyTIPDetailID')::text 
 when ((vs.statuses->0->>'status')::text='DRAFT' AND (vs.statuses->1->>'status')::text='ACTIVE') then (vs.statuses->1->>'legacyTIPDetailID')::text 
 when (vs.statuses->0->>'status')::text='DRAFT' then (vs.statuses->0->>'legacyTIPDetailID')::text 
 when ((vs.statuses->0->>'status')::text='SCHEDULED' AND (vs.statuses->1->>'status')::text='ACTIVE') then (vs.statuses->1->>'legacyTIPDetailID')::text 
 when (vs.statuses->0->>'status')::text='SCHEDULED' then (vs.statuses->0->>'legacyTIPDetailID')::text 
 else (vs.statuses->1->>'serviceType')::text end as legacyTIPDetailID,
 vs."serviceID" as serviceID,
 vs."statuses" as statuses,
 (
    select json_agg("name") from "service"."AttributesDefinition" where "attributesDefinitionID"
	in (select unnest(string_to_array(TRIM('[]' FROM metadata::json->>'attributes'),',')::int[])  from "service"."ServiceAttributes"
		where "serviceID"=vs."serviceID" and "globalServiceVersion"=(case 
		when (vs.statuses->0->>'status')::text='ACTIVE' then (vs.statuses->0->>'globalServiceVersion')::int 
		when ((vs.statuses->0->>'status')::text='DRAFT' AND (vs.statuses->1->>'status')::text='ACTIVE') then (vs.statuses->1->>'globalServiceVersion')::int 
		when (vs.statuses->0->>'status')::text='DRAFT' then (vs.statuses->0->>'globalServiceVersion')::int 
		when ((vs.statuses->0->>'status')::text='SCHEDULED' AND (vs.statuses->1->>'status')::text='ACTIVE') then (vs.statuses->1->>'globalServiceVersion')::int 
		when (vs.statuses->0->>'status')::text='SCHEDULED' then (vs.statuses->0->>'globalServiceVersion')::int 
		else (vs.statuses->1->>'globalServiceVersion')::int end)
	)
) as "attributes"
from (
select s1."serviceID",
JSONB_AGG(
			(
			  SELECT 
				X 
			  FROM 
				(
				  SELECT 
                    s1."serviceName",
					s1."globalServiceVersion", 
					s1."validFrom", 
					s1."validTill", 
					s1."isPublished",
					s1."legacyTIPDetailID",
                    "ServiceType"."serviceType",
					CASE 
					WHEN ((s1."validFrom" < now() AND s1."validTill" >= now()) OR (s1."validFrom" < now() AND s1."validTill" IS NULL)  AND s1."isPublished" = 1) THEN 'ACTIVE' 
					WHEN (s1."validFrom" IS NOT NULL AND s1."validFrom" > now() AND ((s1."validTill" IS NOT NULL AND s1."validFrom" < s1."validTill") OR (s1."validTill" IS NULL)) AND s1."isPublished" = 1 ) THEN 'SCHEDULED' 
					WHEN (s1."isPublished" = 0 AND s1."validTill" IS NULL AND s1."validFrom" IS NULL) THEN 'DRAFT' 
					WHEN (s1."validFrom" IS NOT NULL AND s1."validTill" IS NOT NULL AND s1."validFrom" < s1."validTill" AND s1."validTill" < now()) THEN 'INACTIVE' 
					END AS "status"
				) AS X
                
			) 
		  ) AS "statuses"
          
from service."Service" s1
    JOIN service."ServiceType" on s1."serviceTypeID" = "ServiceType"."serviceTypeID" 
where (s1."validTill" IS NULL 
		  OR s1."validTill" > NOW()) 

      group by "serviceID" 
        order by "serviceID" desc
) vs
) vvs
where (servicename ILIKE :searchKey OR serviceid::text like :searchKey OR servicetype ILIKE :searchKey OR legacytipdetailid::text ILIKE :searchKey OR attributes::text ILIKE :searchKey)
order by ${sortBy} ${sortOrder}
    limit :limit offset :offset;`;
};

export const QExpiredServiceList = (sortBy, sortOrder) => {
	return `select 
	* 
  from 
	(
	  select 
		case when (vs.statuses -> 0 ->> 'status'):: text = 'ACTIVE' then (vs.statuses -> 0 ->> 'serviceName'):: text when (
		  (vs.statuses -> 0 ->> 'status'):: text = 'DRAFT' 
		  AND (vs.statuses -> 1 ->> 'status'):: text = 'ACTIVE'
		) then (vs.statuses -> 1 ->> 'serviceName'):: text when (vs.statuses -> 0 ->> 'status'):: text = 'DRAFT' then (vs.statuses -> 0 ->> 'serviceName'):: text when (
		  (vs.statuses -> 0 ->> 'status'):: text = 'SCHEDULED' 
		  AND (vs.statuses -> 1 ->> 'status'):: text = 'ACTIVE'
		) then (vs.statuses -> 1 ->> 'serviceName'):: text when (vs.statuses -> 0 ->> 'status'):: text = 'SCHEDULED' then (vs.statuses -> 0 ->> 'serviceName'):: text when (vs.statuses -> 0 ->> 'status'):: text = 'INACTIVE' then (vs.statuses -> 0 ->> 'serviceName'):: text else (vs.statuses -> 1 ->> 'serviceName'):: text end as servicename, 
		case when (vs.statuses -> 0 ->> 'status'):: text = 'ACTIVE' then (vs.statuses -> 0 ->> 'serviceType'):: text when (
		  (vs.statuses -> 0 ->> 'status'):: text = 'DRAFT' 
		  AND (vs.statuses -> 1 ->> 'status'):: text = 'ACTIVE'
		) then (vs.statuses -> 1 ->> 'serviceType'):: text when (vs.statuses -> 0 ->> 'status'):: text = 'DRAFT' then (vs.statuses -> 0 ->> 'serviceType'):: text when (
		  (vs.statuses -> 0 ->> 'status'):: text = 'SCHEDULED' 
		  AND (vs.statuses -> 1 ->> 'status'):: text = 'ACTIVE'
		) then (vs.statuses -> 1 ->> 'serviceType'):: text when (vs.statuses -> 0 ->> 'status'):: text = 'SCHEDULED' then (vs.statuses -> 0 ->> 'serviceType'):: text when (vs.statuses -> 0 ->> 'status'):: text = 'INACTIVE' then (vs.statuses -> 0 ->> 'serviceType'):: text else (vs.statuses -> 1 ->> 'serviceType'):: text end as serviceType, 
		case when (vs.statuses -> 0 ->> 'status'):: text = 'ACTIVE' then (
		  vs.statuses -> 0 ->> 'legacyTIPDetailID'
		):: text when (
		  (vs.statuses -> 0 ->> 'status'):: text = 'DRAFT' 
		  AND (vs.statuses -> 1 ->> 'status'):: text = 'ACTIVE'
		) then (
		  vs.statuses -> 1 ->> 'legacyTIPDetailID'
		):: text when (vs.statuses -> 0 ->> 'status'):: text = 'DRAFT' then (
		  vs.statuses -> 0 ->> 'legacyTIPDetailID'
		):: text when (
		  (vs.statuses -> 0 ->> 'status'):: text = 'SCHEDULED' 
		  AND (vs.statuses -> 1 ->> 'status'):: text = 'ACTIVE'
		) then (
		  vs.statuses -> 1 ->> 'legacyTIPDetailID'
		):: text when (vs.statuses -> 0 ->> 'status'):: text = 'SCHEDULED' then (
		  vs.statuses -> 0 ->> 'legacyTIPDetailID'
		):: text when (vs.statuses -> 0 ->> 'status'):: text = 'INACTIVE' then (
		  vs.statuses -> 0 ->> 'legacyTIPDetailID'
		):: text else (
		  vs.statuses -> 1 ->> 'legacyTIPDetailID'
		):: text end as legacyTIPDetailID, 
		vs."serviceID" as serviceID, 
		vs."statuses" as statuses, 
		(
		  select 
			json_agg("name") 
		  from 
			"service"."AttributesDefinition" 
		  where 
			"attributesDefinitionID" in (
			  select 
				unnest(
				  string_to_array(
					TRIM(
					  '[]' 
					  FROM 
						metadata :: json ->> 'attributes'
					), 
					','
				  ):: int[]
				) 
			  from 
				"service"."ServiceAttributes" 
			  where 
				"serviceID" = vs."serviceID" 
				and "globalServiceVersion" =(
				  case when (vs.statuses -> 0 ->> 'status'):: text = 'ACTIVE' then (
					vs.statuses -> 0 ->> 'globalServiceVersion'
				  ):: int when (
					(vs.statuses -> 0 ->> 'status'):: text = 'DRAFT' 
					AND (vs.statuses -> 1 ->> 'status'):: text = 'ACTIVE'
				  ) then (
					vs.statuses -> 1 ->> 'globalServiceVersion'
				  ):: int when (vs.statuses -> 0 ->> 'status'):: text = 'DRAFT' then (
					vs.statuses -> 0 ->> 'globalServiceVersion'
				  ):: int when (
					(vs.statuses -> 0 ->> 'status'):: text = 'SCHEDULED' 
					AND (vs.statuses -> 1 ->> 'status'):: text = 'ACTIVE'
				  ) then (
					vs.statuses -> 1 ->> 'globalServiceVersion'
				  ):: int when (vs.statuses -> 0 ->> 'status'):: text = 'SCHEDULED' then (
					vs.statuses -> 0 ->> 'globalServiceVersion'
				  ):: int when (vs.statuses -> 0 ->> 'status'):: text = 'INACTIVE' then (
					vs.statuses -> 0 ->> 'globalServiceVersion'
				  ):: int else (
					vs.statuses -> 1 ->> 'globalServiceVersion'
				  ):: int end
				)
			)
		) as "attributes" 
	  from 
		(
		  select 
			s1."serviceID", 
			JSONB_AGG(
			  (
				SELECT 
				  X 
				FROM 
				  (
					SELECT 
					  s1."serviceName", 
					  s1."globalServiceVersion", 
					  s1."validFrom", 
					  s1."validTill", 
					  s1."isPublished", 
					  s1."legacyTIPDetailID", 
					  "ServiceType"."serviceType", 
					  CASE 
					  WHEN ((s1."validFrom" < now() AND s1."validTill" >= now()) OR (s1."validFrom" < now() AND s1."validTill" IS NULL) AND s1."isPublished" = 1) THEN 'ACTIVE' 
					  WHEN (s1."validFrom" IS NOT NULL AND s1."validFrom" > now() AND ((s1."validTill" IS NOT NULL AND s1."validFrom" < s1."validTill") OR (s1."validTill" IS NULL)) AND s1."isPublished" = 1) THEN 'SCHEDULED' 
					  WHEN (s1."isPublished" = 0 AND s1."validFrom" IS NULL AND s1."validTill" IS NULL ) THEN 'DRAFT' 
					  WHEN (
						s1."globalServiceVersion" = (
						  SELECT 
							MAX(s2."globalServiceVersion") 
						  FROM 
							service."Service" s2 
						  where 
							s2."serviceID" = s1."serviceID" 
							AND s2."validTill" < NOW() 
							AND s1."validFrom" IS NOT NULL AND s1."validTill" IS NOT NULL
						)
					  ) THEN 'INACTIVE' ELSE 'EXPIRED' END AS "status"
				  ) AS X 
				where 
				  X."status" != 'EXPIRED'
			  )
			) AS "statuses" 
		  from 
			service."Service" s1 
			JOIN service."ServiceType" on s1."serviceTypeID" = "ServiceType"."serviceTypeID" 
		  WHERE 
			(
			  ((s1."validFrom" < now() AND s1."validTill" >= now()) OR (s1."validFrom" < now() AND s1."validTill" IS NULL) AND s1."isPublished" = 1) 
			  OR 
			  (s1."validFrom" IS NOT NULL AND s1."validFrom" > now() AND ((s1."validTill" IS NOT NULL AND s1."validFrom" < s1."validTill") OR (s1."validTill" IS NULL)) AND s1."isPublished" = 1) 
			  OR 
			  ((s1."isPublished" = 0 AND s1."validFrom" IS NULL AND s1."validTill" IS NULL )) 
			  OR 
			  (
				s1."globalServiceVersion" = (
				  SELECT 
					MAX(s3."globalServiceVersion") 
				  FROM 
					service."Service" s3 
				  where 
					s3."serviceID" = s1."serviceID" 
					AND s3."validTill" < NOW() 
					AND s3."serviceID" NOT IN (
					  select 
						s4."serviceID" 
					  from 
						service."Service" s4 
					  where 
						(
						  ( s4."validFrom" < now()  AND s4."validTill" >= now() )  OR ( s4."validFrom" < now() AND s4."validTill" IS NULL )  AND s4."isPublished" = 1
						)
					)
				)
			  )
			) 
		  group by 
			"serviceID" 
		  order by 
			"serviceID" desc
		) vs
	) vvs 
  where 
	(
	  servicename ILIKE :searchKey 
	  OR serviceid :: text like :searchKey 
	  OR servicetype ILIKE :searchKey 
	  OR legacytipdetailid :: text ILIKE :searchKey 
	  OR attributes :: text ILIKE :searchKey
	) 
  order by 
	${sortBy} ${sortOrder} 
  limit :limit 
  offset :offset;
  `;
};

export const QServiceDetails = ` SELECT 
s2."globalServiceVersion" AS "activeVersion", 
s2."serviceName" AS "activeServiceName",
s3."globalServiceVersion" AS "scheduledVersion", 
s3."serviceName" AS "scheduledServiceName",
s4."globalServiceVersion" AS "draftVersion", 
s4."serviceName" AS "draftServiceName",
s2."validFrom" AS "activeStartDate", 
s3."validFrom" AS "scheduledStartDate",
s5."globalServiceVersion" AS "inactiveVersion",
s5."serviceName" AS "inactiveServiceName"
FROM 
service."Service" s1 
LEFT JOIN service."Service" AS s2 ON s1."serviceID" = s2."serviceID" 
AND s2."globalServiceVersion" IN (
  SELECT 
	"globalServiceVersion" 
  FROM 
	service."Service" 
  WHERE 
	"serviceID" = :serviceID 
	AND "isPublished" = 1 
	AND (
	  "validTill" IS NULL 
	  OR "validTill" >= now()
	) 
	AND "validFrom" <= now()
) 
LEFT JOIN service."Service" AS s3 ON s1."serviceID" = s3."serviceID" 
AND s3."globalServiceVersion" IN (
  SELECT 
	"globalServiceVersion" 
  FROM 
	service."Service" 
  WHERE 
	"serviceID" = :serviceID
	AND "isPublished" = 1 
	AND "validFrom" IS NOT NULL AND "validFrom" > NOW() AND (("validTill" IS NOT NULL AND "validFrom" < "validTill") OR ("validTill" IS NULL))
) 
LEFT JOIN service."Service" AS s4 ON s1."serviceID" = s4."serviceID" 
AND s4."globalServiceVersion" IN (
  SELECT 
	"globalServiceVersion" 
  FROM 
	service."Service" 
  WHERE 
	"serviceID" = :serviceID 
	AND "isPublished" = 0 AND "validTill" IS NULL AND "validFrom" IS NULL
)
LEFT JOIN service."Service" AS s5 ON s1."serviceID" = s5."serviceID" 
AND s5."globalServiceVersion" IN (
  SELECT 
	MAX("globalServiceVersion")
  FROM 
	service."Service" 
  WHERE 
	"serviceID" = :serviceID 
	AND "validTill" < NOW() AND "validTill" IS NOT NULL AND "validFrom" IS NOT NULL AND "serviceID" NOT IN (
		select 
		ss5."serviceID" 
		from 
		  service."Service" ss5
		where 
		  (
			( ss5."validFrom" < now()  AND ss5."validTill" >= now() )  OR ( ss5."validFrom" < now() AND ss5."validTill" IS NULL )  AND ss5."isPublished" = 1
		  )
	  )
) 
WHERE 
s1."serviceID" = :serviceID FETCH first row only`;

export const QCheckConfigCount = `SELECT count(*)
FROM service."ServiceModuleConfig" WHERE "serviceID" = :serviceID AND "moduleID" = :moduleID`;

export const QUpdateModuleConfig = `UPDATE service."ServiceModuleConfig"
SET "moduleVersion"= :moduleVersion
WHERE ("ServiceModuleConfig"."serviceID" = :serviceID AND "moduleID" = :moduleID);`;

export const QAddModuleConfig = `INSERT INTO service."ServiceModuleConfig"(
	"serviceID", "moduleID", "moduleVersion", status)
	VALUES (:serviceID, :moduleID, :moduleVersion, null)`;

export const QMissingModules = `SELECT "Modules"."moduleID", "Modules"."moduleName" FROM service."Modules" WHERE "Modules"."moduleID" NOT IN 
	(SELECT "ServiceModuleConfig"."moduleID" FROM service."ServiceModuleConfig" WHERE  "ServiceModuleConfig"."moduleID" = "Modules"."moduleID" AND  "ServiceModuleConfig"."serviceID" = :serviceID AND "ServiceModuleConfig"."moduleVersion" = :globalServiceVersion)
	AND "Modules"."isMandatory" = true`;

export const QServiceActiveOrInActive =
	'SELECT "globalServiceVersion" FROM service."Service" WHERE "serviceID" = :serviceID AND "isPublished" = 1 and ((("validTill" IS NULL OR "validTill" >= NOW()) AND "validFrom" <= NOW()) OR ("validTill" IS NOT NULL and "validTill" < NOW()));';

export const QServiceActiveVersion =
	'SELECT "globalServiceVersion" FROM service."Service" WHERE "serviceID" = :serviceID AND "isPublished" = 1 AND ("validTill" IS NULL OR "validTill" >= NOW()) AND "validFrom" <= NOW();';

export const QGetServiceAttributesMetaData = `SELECT metadata ->> 'attributes' AS attributes, "serviceID", "globalServiceVersion" FROM service."ServiceAttributes" where "serviceID" 
	in (SELECT "serviceID" FROM service."Service" where "isPublished" = 1 AND ("validTill" IS NULL OR "validTill" >= NOW()) AND "validFrom" <= NOW()
		and "serviceID" = :serviceID)  and "globalServiceVersion" 
	in (SELECT "globalServiceVersion" FROM service."Service" where "isPublished" = 1 AND ("validTill" IS NULL OR "validTill" >= NOW()) AND "validFrom" <= NOW() and "globalServiceVersion" = :globalServiceVersion) 
        ORDER BY  "serviceID";`;

export const QGetServiceAttributesName = `select "name", "categoryName" from service."AttributesDefinition" 
where "attributesDefinitionID" in (:attributesDefinitionID) ORDER BY "attributesDefinitionID"`;

export const QServiceActiveVersionForLegacyId = `SELECT "serviceID","legacyTIPDetailID","globalServiceVersion", "validFrom","validTill",
	CASE 
		WHEN (("validFrom" < now() AND "validTill" >= now()) OR ("validFrom" < now() AND "validTill" IS NULL) AND "isPublished" = 1) THEN 'ACTIVE' 
		WHEN ("validFrom" IS NOT NULL AND "validFrom" > now() AND (("validTill" IS NOT NULL AND "validFrom" < "validTill") OR ("validTill" IS NULL)) AND "isPublished" = 1 ) THEN 'SCHEDULED' 
		WHEN ("isPublished" = 0 AND "validTill" IS NULL AND "validFrom" IS NULL) THEN 'DRAFT' 
		WHEN ("validFrom" IS NOT NULL AND "validTill" IS NOT NULL AND "validFrom" < "validTill" AND "validTill" < now()) THEN 'INACTIVE' 
		END AS "status"
	FROM service."Service"
	WHERE "legacyTIPDetailID" = :legacyTIPDetailID 
	AND "isPublished" = 1 
	AND ("validTill" IS NULL OR "validTill" >= NOW()) 
	AND "validFrom" <= NOW();`;

export const QGetServiceTipNameForserviceID = `SELECT st."serviceType", s."serviceID", s."serviceDisplayName", s."globalServiceVersion", s."validFrom", s."validTill"
FROM service."ServiceType" st, service."Service" s where st."serviceTypeID" = s."serviceTypeID" 
and s."serviceID" = :serviceID and s."globalServiceVersion" = :globalServiceVersion;`;

export const QGetServiceTipNameForLegacyTipID = `SELECT st."serviceType", s."serviceID", s."serviceDisplayName", s."globalServiceVersion", s."validFrom", s."validTill"
FROM service."ServiceType" st, service."Service" s where st."serviceTypeID" = s."serviceTypeID" 
and s."legacyTIPDetailID" = :legacyTIPDetailID and s."globalServiceVersion" = :globalServiceVersion;`;

export const QServiceDetailsActiveOrInActive = `SELECT "serviceID", "legacyTIPDetailID", "globalServiceVersion", "validFrom", "validTill",
	CASE 
		WHEN (("validFrom" < now() AND "validTill" >= now()) OR ("validFrom" < now() AND "validTill" IS NULL) AND "isPublished" = 1) THEN 'ACTIVE' 
		WHEN ("validFrom" IS NOT NULL AND "validFrom" > now() AND (("validTill" IS NOT NULL AND "validFrom" < "validTill") OR ("validTill" IS NULL)) AND "isPublished" = 1 ) THEN 'SCHEDULED' 
		WHEN ("isPublished" = 0 AND "validTill" IS NULL AND "validFrom" IS NULL) THEN 'DRAFT' 
		WHEN ("validFrom" IS NOT NULL AND "validTill" IS NOT NULL AND "validFrom" < "validTill" AND "validTill" < now()) THEN 'INACTIVE' 
		END AS "status"
  FROM service."Service"
  WHERE "serviceID" = :serviceID AND "isPublished" = 1 AND
	("validTill" IS NULL OR "validTill" >= NOW()) AND "validFrom" <= NOW();`;

export const QActiveServiceListCount = `SELECT s."serviceID", 
s."globalServiceVersion", 
s."validFrom", 
s."validTill", 
s."isPublished", 
s."legacyTIPDetailID", 
ad.name, 
ad."categoryName", 
sa."globalServiceVersion" AS sa_globalServiceVersion,
CASE 
	WHEN ((s."validFrom" < now() AND s."validTill" >= now()) OR (s."validFrom" < now() AND s."validTill" IS NULL) AND s."isPublished" = 1) THEN 'ACTIVE' 
	WHEN (s."validFrom" IS NOT NULL AND s."validFrom" > now() AND ((s."validTill" IS NOT NULL AND s."validFrom" < s."validTill") OR (s."validTill" IS NULL)) AND s."isPublished" = 1 ) THEN 'SCHEDULED' 
	WHEN (s."isPublished" = 0 AND s."validTill" IS NULL AND s."validFrom" IS NULL) THEN 'DRAFT' 
	WHEN (s."validFrom" IS NOT NULL AND s."validTill" IS NOT NULL AND s."validFrom" < s."validTill" AND s."validTill" < now()) THEN 'INACTIVE' 
	END AS "status"
FROM service."Service" s 
LEFT JOIN (
SELECT "serviceID", metadata ->> 'attributes' AS attributes, "globalServiceVersion"
FROM service."ServiceAttributes"
) sa ON sa."serviceID" = s."serviceID" AND sa."globalServiceVersion" = s."globalServiceVersion"
LEFT JOIN service."AttributesDefinition" ad ON sa.attributes::jsonb @> to_jsonb(array[ad."attributesDefinitionID"]::integer[]) 
WHERE s."isPublished" = 1 AND (s."validTill" IS NULL OR s."validTill" >= NOW()) AND s."validFrom" <= NOW()
ORDER BY "serviceID";`;

export const QServiceDetailsForVersions = `SELECT "serviceID", "legacyTIPDetailID", "globalServiceVersion", "validFrom", "validTill", 
CASE 
	WHEN ((s."validFrom" < now() AND s."validTill" >= now()) OR (s."validFrom" < now() AND s."validTill" IS NULL) AND s."isPublished" = 1) THEN 'ACTIVE' 
	WHEN (s."validFrom" IS NOT NULL AND s."validFrom" > now() AND ((s."validTill" IS NOT NULL AND s."validFrom" < s."validTill") OR (s."validTill" IS NULL)) AND s."isPublished" = 1 ) THEN 'SCHEDULED' 
	WHEN (s."isPublished" = 0 AND s."validTill" IS NULL AND s."validFrom" IS NULL) THEN 'DRAFT' 
	WHEN (s."validFrom" IS NOT NULL AND s."validTill" IS NOT NULL AND s."validFrom" < s."validTill" AND s."validTill" < now()) THEN 'INACTIVE' 
END AS "status"
  FROM service."Service" s
  WHERE "serviceID" = :serviceID AND "globalServiceVersion" = :globalServiceVersion;`;

export const QGetAttributesMetaDataForVersion = `SELECT metadata ->> 'attributes' AS attributes, "serviceID", "globalServiceVersion" FROM service."ServiceAttributes" where "serviceID" 
in (SELECT "serviceID" FROM service."Service" where "serviceID" = :serviceID)  and "globalServiceVersion" 
in (SELECT "globalServiceVersion" FROM service."Service" where "globalServiceVersion" = :globalServiceVersion) ;`;

export const QgetActiveServices = `SELECT s."serviceID", 
s."globalServiceVersion", 
s."validFrom", 
s."validTill", 
s."isPublished", 
s."legacyTIPDetailID", 
ad."name", 
ad."categoryName", 
sa."globalServiceVersion" AS sa_globalServiceVersion,
CASE 
	WHEN ((s."validFrom" < now() AND s."validTill" >= now()) OR (s."validFrom" < now() AND s."validTill" IS NULL) AND s."isPublished" = 1) THEN 'ACTIVE' 
	WHEN (s."validFrom" IS NOT NULL AND s."validFrom" > now() AND ((s."validTill" IS NOT NULL AND s."validFrom" < s."validTill") OR (s."validTill" IS NULL)) AND s."isPublished" = 1 ) THEN 'SCHEDULED' 
	WHEN (s."isPublished" = 0 AND s."validTill" IS NULL AND s."validFrom" IS NULL) THEN 'DRAFT' 
	WHEN (s."validFrom" IS NOT NULL AND s."validTill" IS NOT NULL AND s."validFrom" < s."validTill" AND s."validTill" < now()) THEN 'INACTIVE' 
	END AS "status",
    stypes."serviceType"
FROM service."Service" s 
LEFT JOIN (
SELECT "serviceID", metadata ->> 'attributes' AS attributes, "globalServiceVersion"
FROM service."ServiceAttributes"
) sa ON sa."serviceID" = s."serviceID" AND sa."globalServiceVersion" = s."globalServiceVersion"
LEFT JOIN service."AttributesDefinition" ad ON sa.attributes::jsonb @> to_jsonb(array[ad."attributesDefinitionID"]::integer[]) 
LEFT JOIN service."ServiceType" as stypes on stypes."serviceTypeID"=s."serviceTypeID"
WHERE s."isPublished" = 1 AND (s."validTill" IS NULL OR s."validTill" >= NOW()) AND s."validFrom" <= NOW()
ORDER BY "serviceID";`;

export const QGetNonInActiveServicesWithSearch = (sortBy: any, sortOrder: any) =>
	`SELECT * FROM 
			( SELECT s."serviceID" as serviceid, s."serviceName" as servicename,st."serviceType" as servicetype,s."globalServiceVersion", s."validFrom", s."validTill", s."isPublished", s."legacyTIPDetailID" as legacytipdetailid, s.status,
				(SELECT json_agg("name") FROM "service"."AttributesDefinition" WHERE "attributesDefinitionID"
					in ( SELECT unnest(string_to_array(TRIM('[]' FROM metadata::json->>'attributes'),',')::int[]))) as attributes
	FROM service."Service"  s 
	LEFT JOIN service."ServiceAttributes" sa ON s."serviceID" = sa."serviceID" AND s."globalServiceVersion" = sa."globalServiceVersion"
	JOIN service."ServiceType" st ON s."serviceTypeID" = st."serviceTypeID" )  services
	WHERE (services.servicename ILIKE :searchKey
		   OR services.serviceid::text LIKE :searchKey
		   OR services.servicetype ILIKE :searchKey
		   OR services.legacytipdetailid::text ILIKE :searchKey
		   OR services.attributes::text ILIKE :searchKey) AND services.status != 'INACTIVE'
    ORDER BY ${sortBy} ${sortOrder} LIMIT :limit OFFSET :offset;`;

export const QGetNonInActiveServices = (sortBy: any, sortOrder: any) =>
	`SELECT * FROM 
			( SELECT s."serviceID" as serviceid, s."serviceName" as servicename,st."serviceType" as servicetype,s."validFrom", s."validTill", s."isPublished", s."globalServiceVersion", s."legacyTIPDetailID" as legacytipdetailid, s.status,
				(SELECT json_agg("name") FROM "service"."AttributesDefinition" WHERE "attributesDefinitionID"
					in ( SELECT unnest(string_to_array(TRIM('[]' FROM metadata::json->>'attributes'),',')::int[]))) as attributes
	FROM service."Service"  s 
	LEFT JOIN service."ServiceAttributes" sa ON s."serviceID" = sa."serviceID" AND s."globalServiceVersion" = sa."globalServiceVersion"
	JOIN service."ServiceType" st ON s."serviceTypeID" = st."serviceTypeID" )  services
	WHERE services.status != 'INACTIVE'
    ORDER BY ${sortBy} ${sortOrder} LIMIT :limit OFFSET :offset;`;

export const QGetAllServicesWithSearch = (sortBy: any, sortOrder: any) =>
	`SELECT * FROM 
			( SELECT s."serviceID" as serviceid, s."serviceName"  as servicename,s."validFrom", s."validTill", s."isPublished", st."serviceType" as servicetype,s."globalServiceVersion", s."legacyTIPDetailID" as legacytipdetailid, s.status,
				(SELECT json_agg("name") FROM "service"."AttributesDefinition" WHERE "attributesDefinitionID"
					in ( SELECT unnest(string_to_array(TRIM('[]' FROM metadata::json->>'attributes'),',')::int[]))) as attributes
	FROM service."Service"  s 
	LEFT JOIN service."ServiceAttributes" sa ON s."serviceID" = sa."serviceID" AND s."globalServiceVersion" = sa."globalServiceVersion"
	JOIN service."ServiceType" st ON s."serviceTypeID" = st."serviceTypeID" )  services
	WHERE (services.servicename ILIKE :searchKey
		   OR services.serviceid::text LIKE :searchKey
		   OR services.servicetype ILIKE :searchKey
		   OR services.legacytipdetailid::text ILIKE :searchKey
		   OR services.attributes::text ILIKE :searchKey)
    ORDER BY ${sortBy} ${sortOrder} LIMIT :limit OFFSET :offset;`;

export const QGetAllServices = (sortBy: any, sortOrder: any) =>
	`SELECT * FROM 
			( SELECT s."serviceID" as serviceid, s."serviceName" as servicename,s."validFrom", s."validTill", s."isPublished", st."serviceType" as servicetype,s."globalServiceVersion", s."legacyTIPDetailID" as legacytipdetailid, s.status,
				(SELECT json_agg("name") FROM "service"."AttributesDefinition" WHERE "attributesDefinitionID"
					in ( SELECT unnest(string_to_array(TRIM('[]' FROM metadata::json->>'attributes'),',')::int[]))) as attributes
	FROM service."Service"  s 
	LEFT JOIN service."ServiceAttributes" sa ON s."serviceID" = sa."serviceID" AND s."globalServiceVersion" = sa."globalServiceVersion"
	JOIN service."ServiceType" st ON s."serviceTypeID" = st."serviceTypeID" )  services
    ORDER BY ${sortBy} ${sortOrder} LIMIT :limit OFFSET :offset;`;

export const QGetAllServiceIDs = (sortBy: any, sortOrder: any) =>
	`select DISTINCT "serviceID" as serviceid,"serviceName"  from service."Service" where "status" in ('ACTIVE','DRAFT','SCHEDULED')  
	ORDER BY ${sortBy} ${sortOrder} LIMIT :limit OFFSET :offset;`;

export const QGetAllServicesFromServiceID = (sortBy: any, sortOrder: any,idsTxt: any) =>
`select s."serviceID" as serviceid, s."serviceName" as servicename,s."validFrom", s."validTill", s."isPublished", st."serviceType" as servicetype,s."globalServiceVersion", s."legacyTIPDetailID" as legacytipdetailid, s.status, sa.metadata
from service."Service" s 
LEFT JOIN service."ServiceAttributes" sa ON s."serviceID" = sa."serviceID" AND s."globalServiceVersion" = sa."globalServiceVersion"
JOIN service."ServiceType" st ON s."serviceTypeID" = st."serviceTypeID"
where s."status" in ('ACTIVE','DRAFT','SCHEDULED') and s."serviceID" in (${idsTxt})  
ORDER BY ${sortBy} ${sortOrder};`;

export const QGetAllServiceIDsCount = () =>
	`select COUNT(DISTINCT "serviceID") AS count from service."Service" where "status" in ('ACTIVE','DRAFT','SCHEDULED')`;

export const QAttributesDefinition = () => 
`select * FROM "service"."AttributesDefinition"`;

export const QGetAllServiceIDsWithFilter = (sortBy: any, sortOrder: any) =>
`select DISTINCT z."serviceID",z."servicename" from (select X.* from (select s."serviceID",s."serviceName" as servicename,s."legacyTIPDetailID",s."status",  (SELECT json_agg(ad1."name") FROM "service"."AttributesDefinition" ad1 WHERE ad1."attributesDefinitionID" in (select unnest(string_to_array(TRIM('[]' FROM sa.metadata::json->>'attributes'),',')::int[])))::text as attributess       
from service."Service" s  
LEFT JOIN service."ServiceAttributes" sa ON s."serviceID" = sa."serviceID" AND s."globalServiceVersion" = sa."globalServiceVersion"  
where "status" in ('ACTIVE','DRAFT','SCHEDULED') 
 ) X
where (X."servicename" ILIKE :searchKey OR X."serviceID"::text LIKE :searchKey   OR X."legacyTIPDetailID"::text LIKE :searchKey OR (X."attributess"::text ilike :searchKey and (X."status"='ACTIVE') ))   
) z
ORDER BY ${sortBy} ${sortOrder}
LIMIT :limit OFFSET :offset;`;

// `select DISTINCT z."serviceID",z."serviceName",z."legacyTIPDetailID",z."attributess",z."status" from (
// 	select s."serviceID",s."serviceName",s."legacyTIPDetailID",s."status"
// 	,(SELECT json_agg("name") FROM "service"."AttributesDefinition" WHERE "attributesDefinitionID" in (select unnest(string_to_array(TRIM('[]' FROM sa.metadata::json->>'attributes'),',')::int[])))::text as attributess 
// 	from service."Service" s 
// 	LEFT JOIN service."ServiceAttributes" sa ON s."serviceID" = sa."serviceID" AND s."globalServiceVersion" = sa."globalServiceVersion"
	
// 	where s."status" in ('ACTIVE','DRAFT','SCHEDULED') ) z
// 	where (z."serviceName" ILIKE :searchKey OR z."serviceID"::text LIKE :searchKey OR z."legacyTIPDetailID"::text LIKE :searchKey OR ("attributess"::text ilike :searchKey and "status"='ACTIVE') ) 
// 	ORDER BY ${sortBy} ${sortOrder} LIMIT :limit OFFSET :offset;`;
	// `select DISTINCT "serviceID","serviceName","legacyTIPDetailID" from service."Service" where "status" in ('ACTIVE','DRAFT','SCHEDULED') and ("serviceName" ILIKE :searchKey
	// 	OR "serviceID"::text LIKE :searchKey OR "legacyTIPDetailID"::text LIKE :searchKey)
	//ORDER BY ${sortBy} ${sortOrder} LIMIT :limit OFFSET :offset;`;

	

	export const QGetAllServicesFromServiceIDWithFilter = (sortBy: any, sortOrder: any,idsTxt: any) =>
	`select s."serviceID" as serviceid, s."serviceName" as servicename,s."validFrom", s."validTill", s."isPublished", st."serviceType" as servicetype,s."globalServiceVersion", s."legacyTIPDetailID" as legacytipdetailid, s.status, sa.metadata
	from service."Service" s 
	LEFT JOIN service."ServiceAttributes" sa ON s."serviceID" = sa."serviceID" AND s."globalServiceVersion" = sa."globalServiceVersion"
	JOIN service."ServiceType" st ON s."serviceTypeID" = st."serviceTypeID"
	where s."status" in ('ACTIVE','DRAFT','SCHEDULED') and s."serviceID" in (${idsTxt})
	ORDER BY ${sortBy} ${sortOrder};`;

	export const QGetAllServiceIDsCountWithFilter = () =>
	`select count(b.*) as count from (select DISTINCT z."serviceID" from (select X.* from (select s."serviceID",s."serviceName" as servicename,s."legacyTIPDetailID",s."status",  (SELECT json_agg(ad1."name") FROM "service"."AttributesDefinition" ad1 WHERE ad1."attributesDefinitionID" in (select unnest(string_to_array(TRIM('[]' FROM sa.metadata::json->>'attributes'),',')::int[])))::text as attributess       
	from service."Service" s  
	LEFT JOIN service."ServiceAttributes" sa ON s."serviceID" = sa."serviceID" AND s."globalServiceVersion" = sa."globalServiceVersion"  
	where "status" in ('ACTIVE','DRAFT','SCHEDULED') 
	 ) X
	where (X."servicename" ILIKE :searchKey OR X."serviceID"::text LIKE :searchKey  OR X."legacyTIPDetailID"::text LIKE :searchKey OR (X."attributess"::text ilike :searchKey and (X."status"='ACTIVE') ))   
	) z ) b`;
	

	export const QGetAllServiceIDsWithInactive = (sortBy: any, sortOrder: any) =>
	`select * from (select DISTINCT on (x."serviceid") "serviceid" , x."servicename" from (select "serviceID" as serviceid,"serviceName" as servicename  from service."Service" 
	where "status" in ('ACTIVE','DRAFT','SCHEDULED','INACTIVE') ) x order by x."serviceid",x."servicename" ${sortOrder}) p2 order by ${sortBy} ${sortOrder} LIMIT :limit OFFSET :offset;`;


	// `select DISTINCT b."serviceID" from ( select X."serviceID",X."servicename" from (select "serviceID","serviceName" as servicename  from service."Service" 
	// where "status" in ('ACTIVE','DRAFT','SCHEDULED')  
	// UNION 
	// select "serviceID","serviceName" as servicename from service."Service" 
	// where status='INACTIVE' and "status" NOT IN ('ACTIVE') ) X
	// order by X.${sortBy} ${sortOrder}) b
	// LIMIT :limit OFFSET :offset;`;

	// `select X.* from (select DISTINCT "serviceID","serviceName" as servicename  from service."Service" 
	// where "status" in ('ACTIVE','DRAFT','SCHEDULED')  
	// UNION 
	// select DISTINCT "serviceID","serviceName"  from service."Service" 
	// where status='INACTIVE' and "status" NOT IN ('ACTIVE') ) X
	// ORDER BY X.${sortBy} ${sortOrder} LIMIT :limit OFFSET :offset;`;

	export const QGetAllServicesFromServiceIDWithInactive = (sortBy: any, sortOrder: any,idsTxt: any) =>
`select s."serviceID" as serviceid, s."serviceName" as servicename,s."validFrom", s."validTill", s."isPublished", st."serviceType" as servicetype,s."globalServiceVersion", s."legacyTIPDetailID" as legacytipdetailid,
s."status", sa."metadata"::text
from service."Service" s 
LEFT JOIN service."ServiceAttributes" sa ON s."serviceID" = sa."serviceID" AND s."globalServiceVersion" = sa."globalServiceVersion"
JOIN service."ServiceType" st ON s."serviceTypeID" = st."serviceTypeID"
where s."status" in ('ACTIVE','DRAFT','SCHEDULED') and s."serviceID" in (${idsTxt})
UNION 
(select ss."serviceID" as serviceid, ss."serviceName" as servicename,ss."validFrom", 
ss."validTill", ss."isPublished", st."serviceType" as servicetype,ss."globalServiceVersion", 
ss."legacyTIPDetailID" as legacytipdetailid,
ss."status", sa."metadata"::text from (select max("globalServiceVersion") as versions ,"serviceID" from service."Service"
where "serviceID" in (${idsTxt}) and ("status"='INACTIVE' and 
"serviceID" not in (select "serviceID" from service."Service" where "status"='ACTIVE' 
					and "serviceID" in (${idsTxt}) ) 
) group by "serviceID" ) t1 
join service."Service" ss on ss."serviceID"=t1."serviceID" and ss."globalServiceVersion"=t1."versions"
LEFT JOIN service."ServiceAttributes" sa ON ss."serviceID" = sa."serviceID" AND ss."globalServiceVersion" = sa."globalServiceVersion"
JOIN service."ServiceType" st ON ss."serviceTypeID" = st."serviceTypeID")
ORDER BY ${sortBy} ${sortOrder};`;



export const QGetAllServiceIDsCountWithInactive = () =>
	`select COUNT(DISTINCT "serviceID") AS count from service."Service" where "status" in ('ACTIVE','DRAFT','SCHEDULED','INACTIVE')`;


export const QGetAllServiceIDsWithInactiveFilter = (sortBy: any, sortOrder: any) =>
`select DISTINCT z."serviceID",z."servicename" from (select X.* from (select s."serviceID",s."serviceName" as servicename,s."legacyTIPDetailID",s."status",  (SELECT json_agg(ad1."name") FROM "service"."AttributesDefinition" ad1 WHERE ad1."attributesDefinitionID" in (select unnest(string_to_array(TRIM('[]' FROM sa.metadata::json->>'attributes'),',')::int[])))::text as attributess       
from service."Service" s  
LEFT JOIN service."ServiceAttributes" sa ON s."serviceID" = sa."serviceID" AND s."globalServiceVersion" = sa."globalServiceVersion"  
where "status" in ('ACTIVE','DRAFT','SCHEDULED') 
UNION
select s1."serviceID",s1."serviceName" as servicename,s1."legacyTIPDetailID",s1."status",          
(SELECT json_agg(ad2."name") FROM "service"."AttributesDefinition" ad2  
 WHERE ad2."attributesDefinitionID"    in (select unnest(string_to_array(TRIM('[]' FROM sa.metadata::json->>'attributes'),',')::int[])))::text as attributess  from service."Service" s1      
LEFT JOIN service."ServiceAttributes" sa ON s1."serviceID" = sa."serviceID" AND s1."globalServiceVersion" = sa."globalServiceVersion"      
where status='INACTIVE' and s1."serviceID" not in (select "serviceID" from service."Service" where "status"='ACTIVE' 
and "serviceID"=s1."serviceID" ) ) X
where (X."servicename" ILIKE :searchKey OR X."serviceID"::text LIKE :searchKey   OR X."legacyTIPDetailID"::text LIKE :searchKey OR (X."attributess"::text ilike :searchKey and (X."status"='ACTIVE' OR X."status"='INACTIVE') ))   
) z
ORDER BY ${sortBy} ${sortOrder}
LIMIT :limit OFFSET :offset;`;
// `select X.* from (select DISTINCT s."serviceID",s."serviceName" as servicename,s."legacyTIPDetailID",s."status",
// 	(SELECT json_agg(ad1."name") FROM "service"."AttributesDefinition" ad1 WHERE ad1."attributesDefinitionID" in (select unnest(string_to_array(TRIM('[]' FROM sa.metadata::json->>'attributes'),',')::int[])))::text as attributess 
// 				 from service."Service" s
// 	LEFT JOIN service."ServiceAttributes" sa ON s."serviceID" = sa."serviceID" AND s."globalServiceVersion" = sa."globalServiceVersion"
// 	where "status" in ('ACTIVE','DRAFT','SCHEDULED')  
// 	UNION 
// 	select DISTINCT s1."serviceID",s1."serviceName" as servicename,s1."legacyTIPDetailID",s1."status",  
				 
// 	(SELECT json_agg(ad2."name") FROM "service"."AttributesDefinition" ad2 
// 	 WHERE ad2."attributesDefinitionID" 
// 	 in (select unnest(string_to_array(TRIM('[]' FROM sa.metadata::json->>'attributes'),',')::int[])))::text as attributess
// 	from service."Service" s1
// 				 LEFT JOIN service."ServiceAttributes" sa ON s1."serviceID" = sa."serviceID" AND s1."globalServiceVersion" = sa."globalServiceVersion"
// 				 where status='INACTIVE' and "status" NOT IN ('ACTIVE') ) X
// 	where 
// 	(X."servicename" ILIKE :searchKey OR X."serviceID"::text LIKE :searchKey
// 	 OR X."legacyTIPDetailID"::text LIKE :searchKey OR (X."attributess"::text ilike :searchKey and (X."status"='ACTIVE' OR X."status"='INACTIVE') ))
// 		-- ORDER BY ${sortBy} ${sortOrder} 
// 		LIMIT :limit OFFSET :offset;`;





	export const QGetAllServicesFromServiceIDWithInactiveFilter = (sortBy: any, sortOrder: any,idsTxt: any) =>
// 	`select s."serviceID" as serviceid, s."serviceName" as servicename,s."validFrom", s."validTill", s."isPublished", st."serviceType" as servicetype,s."globalServiceVersion", s."legacyTIPDetailID" as legacytipdetailid,
// s."status", sa."metadata"::text
// from service."Service" s 
// LEFT JOIN service."ServiceAttributes" sa ON s."serviceID" = sa."serviceID" AND s."globalServiceVersion" = sa."globalServiceVersion"
// JOIN service."ServiceType" st ON s."serviceTypeID" = st."serviceTypeID"
// where s."serviceID" in (${idsTxt})
// ORDER BY ${sortBy} ${sortOrder};`;

`select X.* from (select s."serviceID" as serviceid, s."serviceName" as servicename,s."validFrom", s."validTill", s."isPublished", st."serviceType" as servicetype,s."globalServiceVersion", s."legacyTIPDetailID" as legacytipdetailid,
s."status", sa."metadata"::text
from service."Service" s 
LEFT JOIN service."ServiceAttributes" sa ON s."serviceID" = sa."serviceID" AND s."globalServiceVersion" = sa."globalServiceVersion"
JOIN service."ServiceType" st ON s."serviceTypeID" = st."serviceTypeID"
where s."status" in ('ACTIVE','DRAFT','SCHEDULED') and s."serviceID" in (${idsTxt})
UNION 
(select ss."serviceID" as serviceid, ss."serviceName" as servicename,ss."validFrom", ss."validTill", ss."isPublished", st."serviceType" as servicetype,ss."globalServiceVersion", ss."legacyTIPDetailID" as legacytipdetailid,
ss."status", sa."metadata"::text
from service."Service" ss 
LEFT JOIN service."ServiceAttributes" sa ON ss."serviceID" = sa."serviceID" AND ss."globalServiceVersion" = sa."globalServiceVersion"
JOIN service."ServiceType" st ON ss."serviceTypeID" = st."serviceTypeID"
where ss."status"='INACTIVE' and ss."serviceID" in (${idsTxt}) and ss."serviceID" not in (select sss."serviceID" from service."Service" sss
where sss."status"='ACTIVE') order by "globalServiceVersion" desc limit 1)) X
ORDER BY X.${sortBy} ${sortOrder};`;

export const QGetAllServiceIDsCountInactiveWithFilter = () =>
`select count(b.*) as count from (select DISTINCT z."serviceID",z."servicename" from (select X.* from (select s."serviceID",s."serviceName" as servicename,s."legacyTIPDetailID",s."status",  (SELECT json_agg(ad1."name") FROM "service"."AttributesDefinition" ad1 WHERE ad1."attributesDefinitionID" in (select unnest(string_to_array(TRIM('[]' FROM sa.metadata::json->>'attributes'),',')::int[])))::text as attributess       
from service."Service" s  
LEFT JOIN service."ServiceAttributes" sa ON s."serviceID" = sa."serviceID" AND s."globalServiceVersion" = sa."globalServiceVersion"  
where "status" in ('ACTIVE','DRAFT','SCHEDULED') 
UNION
select s1."serviceID",s1."serviceName" as servicename,s1."legacyTIPDetailID",s1."status",          
(SELECT json_agg(ad2."name") FROM "service"."AttributesDefinition" ad2  
 WHERE ad2."attributesDefinitionID"    in (select unnest(string_to_array(TRIM('[]' FROM sa.metadata::json->>'attributes'),',')::int[])))::text as attributess  from service."Service" s1      
LEFT JOIN service."ServiceAttributes" sa ON s1."serviceID" = sa."serviceID" AND s1."globalServiceVersion" = sa."globalServiceVersion"      
where status='INACTIVE' and "status" NOT IN ('ACTIVE') ) X
where (X."servicename" ILIKE :searchKey OR X."serviceID"::text LIKE :searchKey   OR X."legacyTIPDetailID"::text LIKE :searchKey OR (X."attributess"::text ilike :searchKey and (X."status"='ACTIVE' OR X."status"='INACTIVE') ))   
) z
ORDER BY "servicename"  asc) b`;

// `select count(X.*) as count from (select DISTINCT s."serviceID",s."serviceName" as servicename,s."legacyTIPDetailID",s."status",
// 	(SELECT json_agg(ad1."name") FROM "service"."AttributesDefinition" ad1 WHERE ad1."attributesDefinitionID" in (select unnest(string_to_array(TRIM('[]' FROM sa.metadata::json->>'attributes'),',')::int[])))::text as attributess 
// 				 from service."Service" s
// 	LEFT JOIN service."ServiceAttributes" sa ON s."serviceID" = sa."serviceID" AND s."globalServiceVersion" = sa."globalServiceVersion"
// 	where "status" in ('ACTIVE','DRAFT','SCHEDULED')  
// 	UNION 
// 	select DISTINCT s1."serviceID",s1."serviceName" as servicename,s1."legacyTIPDetailID",s1."status",  
				 
// 	(SELECT json_agg(ad2."name") FROM "service"."AttributesDefinition" ad2 
// 	 WHERE ad2."attributesDefinitionID" 
// 	 in (select unnest(string_to_array(TRIM('[]' FROM sa.metadata::json->>'attributes'),',')::int[])))::text as attributess
// 	from service."Service" s1
// 				 LEFT JOIN service."ServiceAttributes" sa ON s1."serviceID" = sa."serviceID" AND s1."globalServiceVersion" = sa."globalServiceVersion"
// 				 where status='INACTIVE' and "status" NOT IN ('ACTIVE') ) X
// 	where 
// 	(X."servicename" ILIKE :searchKey OR X."serviceID"::text LIKE :searchKey
// 	 OR X."legacyTIPDetailID"::text LIKE :searchKey OR (X."attributess"::text ilike :searchKey and (X."status"='ACTIVE' OR X."status"='INACTIVE') ))`;

// `select COUNT(DISTINCT z."serviceID") from (
// 	select s."serviceID",s."serviceName",s."legacyTIPDetailID"
// 	,(SELECT json_agg("name") FROM "service"."AttributesDefinition" WHERE "attributesDefinitionID" in (select unnest(string_to_array(TRIM('[]' FROM sa.metadata::json->>'attributes'),',')::int[])))::text as attributess 
// 	from service."Service" s 
// 	LEFT JOIN service."ServiceAttributes" sa ON s."serviceID" = sa."serviceID" AND s."globalServiceVersion" = sa."globalServiceVersion"
// 	where s.status='INACTIVE' and s."status" NOT IN ('ACTIVE') ) z
// 	where (z."serviceName" ILIKE :searchKey OR z."serviceID"::text LIKE :searchKey OR z."legacyTIPDetailID"::text LIKE :searchKey OR "attributess"::text ilike :searchKey)`;
	
// `select COUNT(DISTINCT X."serviceID") from (select DISTINCT "serviceID","serviceName" as servicename,"legacyTIPDetailID"  from service."Service" 
// 	where "status" in ('ACTIVE','DRAFT','SCHEDULED')  
// 	UNION 
// 	select DISTINCT "serviceID","serviceName","legacyTIPDetailID"  from service."Service" 
// 	where status='INACTIVE' and "status" NOT IN ('ACTIVE') ) X
// 	where (X."servicename" ILIKE :searchKey
// 	OR X."serviceID"::text LIKE :searchKey OR X."legacyTIPDetailID"::text LIKE :searchKey)`;
