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
					CASE WHEN (
					  (
						s1."validFrom" < now() 
						AND s1."validTill" >= now()
					  ) 
					  OR (
						s1."validFrom" < now() 
						AND s1."validTill" IS NULL
					  ) 
					  AND s1."isPublished" = 1
					) THEN 'ACTIVE' WHEN (
					  s1."validFrom" > now() 
					  AND s1."isPublished" = 1
					) THEN 'SCHEDULED' WHEN (s1."isPublished" = 0) THEN 'DRAFT' ELSE 'INACTIVE' END AS "status"
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

export const QServiceDetails = ` SELECT 
s2."globalServiceVersion" AS "activeVersion", 
s2."serviceName" AS "activeServiceName",
s3."globalServiceVersion" AS "scheduledVersion", 
s3."serviceName" AS "scheduledServiceName",
s4."globalServiceVersion" AS "draftVersion", 
s4."serviceName" AS "draftServiceName",
s2."validFrom" AS "activeStartDate", 
s3."validFrom" AS "scheduledStartDate" 
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
	AND "validFrom" > NOW()
) 
LEFT JOIN service."Service" AS s4 ON s1."serviceID" = s4."serviceID" 
AND s4."globalServiceVersion" IN (
  SELECT 
	"globalServiceVersion" 
  FROM 
	service."Service" 
  WHERE 
	"serviceID" = :serviceID 
	AND "isPublished" = 0
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

export const QGetServiceAttributesMetaData =
	'SELECT metadata ->> \'attributes\' AS attributes FROM service."ServiceAttributes" where "serviceID" = :serviceID AND "globalServiceVersion" = :globalServiceVersion;';

export const QGetServiceAttributesName = `select "name", "categoryName" from service."AttributesDefinition" 
where "attributesDefinitionID" in (:attributesDefinitionID) ORDER BY "attributesDefinitionID"`;

export const QServiceActiveVersionForLegacyId =
	'SELECT "serviceID","globalServiceVersion","legacyTIPDetailID" FROM service."Service" WHERE "legacyTIPDetailID" = :legacyTIPDetailID AND "isPublished" = 1 AND ("validTill" IS NULL OR "validTill" >= NOW()) AND "validFrom" <= NOW();';

export const QGetServiceTipNameForserviceID = `SELECT st."serviceType", s."serviceID", s."serviceDisplayName", s."globalServiceVersion", s."validFrom", s."validTill"
FROM service."ServiceType" st, service."Service" s where st."serviceTypeID" = s."serviceTypeID" 
and s."serviceID" = :serviceID and s."globalServiceVersion" = :globalServiceVersion;`;

export const QGetServiceTipNameForLegacyTipID = `SELECT st."serviceType", s."serviceID", s."serviceDisplayName", s."globalServiceVersion", s."validFrom", s."validTill"
FROM service."ServiceType" st, service."Service" s where st."serviceTypeID" = s."serviceTypeID" 
and s."legacyTIPDetailID" = :legacyTIPDetailID and s."globalServiceVersion" = :globalServiceVersion;`;

export const QServiceDeailsActiveOrInActive =
	'SELECT  "serviceID","globalServiceVersion","legacyTIPDetailID" FROM service."Service" WHERE "serviceID" = :serviceID AND "isPublished" = 1 AND ("validTill" IS NULL OR "validTill" >= NOW()) AND "validFrom" <= NOW();';
