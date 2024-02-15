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
	AND status = 'ACTIVE'
) 
LEFT JOIN service."Service" AS s3 ON s1."serviceID" = s3."serviceID" 
AND s3."globalServiceVersion" IN (
  SELECT 
	"globalServiceVersion" 
  FROM 
	service."Service" 
  WHERE 
	"serviceID" = :serviceID
	AND status = 'SCHEDULED'
) 
LEFT JOIN service."Service" AS s4 ON s1."serviceID" = s4."serviceID" 
AND s4."globalServiceVersion" IN (
  SELECT 
	"globalServiceVersion" 
  FROM 
	service."Service" 
  WHERE 
	"serviceID" = :serviceID 
	AND status = 'DRAFT'
)
LEFT JOIN service."Service" AS s5 ON s1."serviceID" = s5."serviceID" 
AND s5."globalServiceVersion" IN (
  SELECT 
	MAX("globalServiceVersion")
  FROM 
	service."Service" 
  WHERE 
	"serviceID" = :serviceID 
	AND status = 'INACTIVE' AND "serviceID" NOT IN (
		select 
		ss5."serviceID" 
		from 
		  service."Service" ss5
		where 
		status = 'ACTIVE'
	  )
) 
WHERE 
s1."serviceID" = :serviceID FETCH first row only`;

export const QAllServicesByStatus = `select  
"globalServiceVersion", "serviceName", "status",
"validFrom" from service."Service"
where "serviceID" = :serviceID`;

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

export const QGetAllServiceIDs = (sortBy: any, sortOrder: any) =>
	`select DISTINCT "serviceID","serviceName"  from service."Service" where "status" in ('ACTIVE','DRAFT','SCHEDULED')  
	ORDER BY "${sortBy}" ${sortOrder} LIMIT :limit OFFSET :offset;`;

export const QGetAllServicesFromServiceID = (sortBy: any, sortOrder: any, idsTxt: any) =>
	`select s."serviceID", s."serviceName" as servicename,s."validFrom", s."validTill", s."isPublished", st."serviceType" as servicetype,s."globalServiceVersion", s."legacyTIPDetailID" as legacytipdetailid, s.status, sa.metadata
from service."Service" s 
LEFT JOIN service."ServiceAttributes" sa ON s."serviceID" = sa."serviceID" AND s."globalServiceVersion" = sa."globalServiceVersion"
JOIN service."ServiceType" st ON s."serviceTypeID" = st."serviceTypeID"
where s."status" in ('ACTIVE','DRAFT','SCHEDULED') and s."serviceID" in (${idsTxt})  
ORDER BY "${sortBy}" ${sortOrder};`;

export const QGetAllServiceIDsCount = () => `select COUNT(DISTINCT "serviceID") AS count from service."Service" 
where "status" in ('ACTIVE','DRAFT','SCHEDULED')`;

export const QAttributesDefinition = () => `select * FROM 
"service"."AttributesDefinition"`;

export const QGetAllServiceIDsWithFilter = (sortBy: any, sortOrder: any) =>
	`select DISTINCT z."serviceID",z."serviceName" from (select X.* from (select s."serviceID",s."serviceName",s."legacyTIPDetailID",s."status",  (SELECT json_agg(ad1."name") FROM "service"."AttributesDefinition" ad1 WHERE ad1."attributesDefinitionID" in (select unnest(string_to_array(TRIM('[]' FROM sa.metadata::json->>'attributes'),',')::int[])))::text as attributess       
from service."Service" s  
LEFT JOIN service."ServiceAttributes" sa ON s."serviceID" = sa."serviceID" AND s."globalServiceVersion" = sa."globalServiceVersion"  
where "status" in ('ACTIVE','DRAFT','SCHEDULED') 
 ) X
where (X."serviceName" ILIKE :searchKey OR X."serviceID"::text LIKE :searchKey OR X."legacyTIPDetailID"::text LIKE :searchKey OR (X."attributess"::text ilike :searchKey and (X."status"='ACTIVE') ))   
) z
ORDER BY "${sortBy}" ${sortOrder}
LIMIT :limit OFFSET :offset;`;

export const QGetAllServicesFromServiceIDWithFilter = (sortBy: any, sortOrder: any, idsTxt: any) =>
	`select s."serviceID", s."serviceName",s."validFrom", s."validTill", s."isPublished", st."serviceType" as servicetype,s."globalServiceVersion", s."legacyTIPDetailID" as legacytipdetailid, s.status, sa.metadata
	from service."Service" s 
	LEFT JOIN service."ServiceAttributes" sa ON s."serviceID" = sa."serviceID" AND s."globalServiceVersion" = sa."globalServiceVersion"
	JOIN service."ServiceType" st ON s."serviceTypeID" = st."serviceTypeID"
	where s."status" in ('ACTIVE','DRAFT','SCHEDULED') and s."serviceID" in (${idsTxt})
	ORDER BY "${sortBy}" ${sortOrder};`;

export const QGetAllServiceIDsCountWithFilter = () =>
	`select count(b.*) as count from (select DISTINCT z."serviceID" from (select X.* from (select s."serviceID",s."serviceName" as servicename,s."legacyTIPDetailID",s."status",  (SELECT json_agg(ad1."name") FROM "service"."AttributesDefinition" ad1 WHERE ad1."attributesDefinitionID" in (select unnest(string_to_array(TRIM('[]' FROM sa.metadata::json->>'attributes'),',')::int[])))::text as attributess       
	from service."Service" s  
	LEFT JOIN service."ServiceAttributes" sa ON s."serviceID" = sa."serviceID" AND s."globalServiceVersion" = sa."globalServiceVersion"  
	where "status" in ('ACTIVE','DRAFT','SCHEDULED') 
	 ) X
	where (X."servicename" ILIKE :searchKey OR X."serviceID"::text LIKE :searchKey  OR X."legacyTIPDetailID"::text LIKE :searchKey OR (X."attributess"::text ilike :searchKey and (X."status"='ACTIVE') ))   
	) z ) b`;

export const QGetAllServiceIDsWithInactive = (sortByNumber: any, sortOrder: any) =>
	`select * from (select DISTINCT on (x."serviceID") "serviceID" , x."serviceName" from (select "serviceID","serviceName" from service."Service" 
	where "status" in ('ACTIVE','DRAFT','SCHEDULED','INACTIVE') ) x order by x."serviceID",x."serviceName" ${sortOrder}) p2 order by ${sortByNumber} ${sortOrder} LIMIT :limit OFFSET :offset;`;

export const QGetAllServicesFromServiceIDWithInactive = (sortBy: any, sortOrder: any, idsTxt: any) =>
	`select s."serviceID", s."serviceName",s."validFrom", s."validTill", s."isPublished", st."serviceType" as servicetype,s."globalServiceVersion", s."legacyTIPDetailID" as legacytipdetailid,
s."status", sa."metadata"::text
from service."Service" s 
LEFT JOIN service."ServiceAttributes" sa ON s."serviceID" = sa."serviceID" AND s."globalServiceVersion" = sa."globalServiceVersion"
JOIN service."ServiceType" st ON s."serviceTypeID" = st."serviceTypeID"
where s."status" in ('ACTIVE','DRAFT','SCHEDULED') and s."serviceID" in (${idsTxt})
UNION 
(select ss."serviceID", ss."serviceName",ss."validFrom", 
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
ORDER BY "${sortBy}" ${sortOrder};`;

export const QGetAllServiceIDsCountWithInactive = () => `select COUNT(DISTINCT "serviceID") AS count from service."Service" 
where "status" in ('ACTIVE','DRAFT','SCHEDULED','INACTIVE');`;

export const QGetAllServiceIDsWithInactiveFilter = (sortBy: any, sortOrder: any) =>
	`select DISTINCT z."serviceID",z."serviceName" from (select X.* from (select s."serviceID",s."serviceName",s."legacyTIPDetailID",s."status",  (SELECT json_agg(ad1."name") FROM "service"."AttributesDefinition" ad1 WHERE ad1."attributesDefinitionID" in (select unnest(string_to_array(TRIM('[]' FROM sa.metadata::json->>'attributes'),',')::int[])))::text as attributess       
from service."Service" s  
LEFT JOIN service."ServiceAttributes" sa ON s."serviceID" = sa."serviceID" AND s."globalServiceVersion" = sa."globalServiceVersion"  
where "status" in ('ACTIVE','DRAFT','SCHEDULED') 
UNION
select s1."serviceID",s1."serviceName",s1."legacyTIPDetailID",s1."status",          
(SELECT json_agg(ad2."name") FROM "service"."AttributesDefinition" ad2  
 WHERE ad2."attributesDefinitionID"    in (select unnest(string_to_array(TRIM('[]' FROM sa.metadata::json->>'attributes'),',')::int[])))::text as attributess  from service."Service" s1      
LEFT JOIN service."ServiceAttributes" sa ON s1."serviceID" = sa."serviceID" AND s1."globalServiceVersion" = sa."globalServiceVersion"      
where status='INACTIVE' and s1."serviceID" not in (select "serviceID" from service."Service" where "status"='ACTIVE' 
and "serviceID"=s1."serviceID" ) ) X
where (X."serviceName" ILIKE :searchKey OR X."serviceID"::text LIKE :searchKey   OR X."legacyTIPDetailID"::text LIKE :searchKey OR (X."attributess"::text ilike :searchKey and (X."status"='ACTIVE' OR X."status"='INACTIVE') ))   
) z
ORDER BY "${sortBy}" ${sortOrder}
LIMIT :limit OFFSET :offset;`;

export const QGetAllServicesFromServiceIDWithInactiveFilter = (sortBy: any, sortOrder: any, idsTxt: any) =>
	`select X.* from (select s."serviceID", s."serviceName",s."validFrom", s."validTill", s."isPublished", st."serviceType" as servicetype,s."globalServiceVersion", s."legacyTIPDetailID" as legacytipdetailid,
s."status", sa."metadata"::text
from service."Service" s 
LEFT JOIN service."ServiceAttributes" sa ON s."serviceID" = sa."serviceID" AND s."globalServiceVersion" = sa."globalServiceVersion"
JOIN service."ServiceType" st ON s."serviceTypeID" = st."serviceTypeID"
where s."status" in ('ACTIVE','DRAFT','SCHEDULED') and s."serviceID" in (${idsTxt})
UNION 
(select ss."serviceID", ss."serviceName",ss."validFrom", ss."validTill", ss."isPublished", st."serviceType" as servicetype,ss."globalServiceVersion", ss."legacyTIPDetailID" as legacytipdetailid,
ss."status", sa."metadata"::text
from service."Service" ss 
LEFT JOIN service."ServiceAttributes" sa ON ss."serviceID" = sa."serviceID" AND ss."globalServiceVersion" = sa."globalServiceVersion"
JOIN service."ServiceType" st ON ss."serviceTypeID" = st."serviceTypeID"
where ss."status"='INACTIVE' and ss."serviceID" in (${idsTxt}) and ss."serviceID" not in (select sss."serviceID" from service."Service" sss
where sss."status"='ACTIVE' and sss."serviceID"=ss."serviceID") order by "globalServiceVersion" desc limit 1)) X
ORDER BY X."${sortBy}" ${sortOrder};`;

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
where s1."status"='INACTIVE' and s1."serviceID" not in (select sss."serviceID" from service."Service" sss
where sss."status"='ACTIVE' and s1."serviceID"=sss."serviceID") ) X
where (X."servicename" ILIKE :searchKey OR X."serviceID"::text LIKE :searchKey   OR X."legacyTIPDetailID"::text LIKE :searchKey OR (X."attributess"::text ilike :searchKey and (X."status"='ACTIVE' OR X."status"='INACTIVE') ))   
) z
ORDER BY "servicename"  asc) b`;

export const QCheckAttributesDefinition = 'select "attributesDefinitionID" from service."AttributesDefinition" where name =:name  and "categoryName" = :category';
