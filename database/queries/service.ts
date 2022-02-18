export const QPolicyList = (sortBy, sortOrder = 'ASC') => {
	return `SELECT s."serviceID", s."serviceName" ,st."serviceType",t."serviceTagName",
    CASE WHEN ("validFrom" > NOW() OR "validTill" <= NOW()) THEN 'INACTIVE' ELSE 'ACTIVE' END AS "status"
    FROM (
        SELECT "serviceID", Array_AGG("serviceTagName") AS "serviceTagName"
        FROM service."ServiceTagMapping" stm JOIN service."ServiceTag" st on st."serviceTagID" = stm."serviceTagID" GROUP BY ("serviceID")
        ) t
    JOIN service."Service" s ON s."serviceID" = t."serviceID"
    JOIN service."ServiceType" st on s."serviceTypeID"=st."serviceTypeID"
    order by "${sortBy}" ${sortOrder}
    limit :limit offset :offset;`;
};
