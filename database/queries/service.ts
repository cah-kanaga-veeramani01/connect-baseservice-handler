export const QServiceList = (sortBy, sortOrder) => {
	return `SELECT * FROM (
        SELECT s."serviceID", s."isPublished", s."serviceName" , st."serviceType", t."serviceTagName",
        CASE WHEN ("validFrom" > NOW() OR "validTill" <= NOW()) THEN 'Inactive' ELSE 'Active' END AS "status",
        s."legacyTIPDetailID"
        FROM (
            SELECT "serviceID", ARRAY_AGG("serviceTagName") AS "serviceTagName", "globalServiceVersion"
            FROM service."ServiceTagMapping" stm JOIN service."ServiceTag" st on st."serviceTagID" = stm."serviceTagID" GROUP BY ("serviceID", "globalServiceVersion")
            ) t
        JOIN service."Service" s ON s."serviceID" = t."serviceID" AND s."globalServiceVersion" = t."globalServiceVersion"
        JOIN service."ServiceType" st on s."serviceTypeID"=st."serviceTypeID"
        UNION
        SELECT s."serviceID", s."isPublished", s."serviceName" , st."serviceType", '{}' AS "serviceTagName",
        CASE WHEN ("validFrom" > NOW() OR "validTill" <= NOW()) THEN 'Inactive' ELSE 'Active' END AS "status",
        s."legacyTIPDetailID"
        FROM service."Service" s JOIN service."ServiceType" st on s."serviceTypeID"=st."serviceTypeID"
        WHERE (s."serviceID", s."globalServiceVersion") NOT IN (SELECT  "serviceID", "globalServiceVersion" from service."ServiceTagMapping")
        ) ds
    
    WHERE (ds."serviceID"::text ILIKE ALL (array[:searchKey])
    OR ds."legacyTIPDetailID"::text ILIKE ALL (array[:searchKey])
        OR ds."serviceType" ILIKE ALL (array[:searchKey])
        OR ds."serviceName" ILIKE ALL (array[:searchKey])
        OR ds."serviceTagName"::text ILIKE ALL (array[:searchKey]))
        AND ds."status" ILIKE :status
        AND ds."isPublished" = 1
    order by "${sortBy}" ${sortOrder}
    limit :limit offset :offset;`;
};

export const QServiceDetails = `SELECT
(SELECT "globalServiceVersion" FROM service."Service" WHERE "serviceID" = :serviceID AND "isPublished" = 1 AND ("validTill" IS NULL OR "validTill" >= NOW()) AND "validFrom" <= NOW()) AS "activeVersion",
(SELECT "globalServiceVersion" FROM service."Service" WHERE "serviceID" = :serviceID AND "isPublished" = 1 AND "validFrom" > NOW()) AS "scheduledVersion",
(SELECT "globalServiceVersion" FROM service."Service" WHERE "serviceID" = :serviceID AND "isPublished" = 0) AS "draftVersion";
`;
