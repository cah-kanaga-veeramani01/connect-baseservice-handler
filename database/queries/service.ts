export const QServiceList = (sortBy, sortOrder) => {
	return `SELECT * FROM (
    SELECT s."serviceID", s."serviceName" , st."serviceType", t."serviceTagName",
    CASE WHEN ("validFrom" > NOW() OR "validTill" <= NOW()) THEN 'INACTIVE' ELSE 'ACTIVE' END AS "status"
    FROM (
        SELECT "serviceID", ARRAY_AGG("serviceTagName") AS "serviceTagName"
        FROM service."ServiceTagMapping" stm JOIN service."ServiceTag" st on st."serviceTagID" = stm."serviceTagID" GROUP BY ("serviceID")
        ) t
    JOIN service."Service" s ON s."serviceID" = t."serviceID"
    JOIN service."ServiceType" st on s."serviceTypeID"=st."serviceTypeID") ds
    WHERE (ds."serviceID"::text ILIKE ALL (array[:searchKey])
        OR ds."serviceType" ILIKE ALL (array[:searchKey])
        OR ds."serviceName" ILIKE ALL (array[:searchKey])
        OR ds."serviceTagName"::text ILIKE ALL (array[:searchKey]))
        AND ds."status" ILIKE :status
    order by "${sortBy}" ${sortOrder}
    limit :limit offset :offset;`;
};
