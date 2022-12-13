ALTER TABLE service."Service" ADD COLUMN IF NOT EXISTS "legacyTIPDetailID" INTEGER;

INSERT INTO service."ServiceTag"("serviceTagName", "createdAt") VALUES ( 'STAR', now());
INSERT INTO service."ServiceTag"("serviceTagName", "createdAt") VALUES ( 'QUALITY', now());
INSERT INTO service."ServiceTag"("serviceTagName", "createdAt") VALUES ( 'COST', now());

SELECT setval('service."ServiceTag_serviceTagID_seq"', (SELECT MAX("serviceTagID") FROM service."ServiceTag"));  


INSERT INTO service."ServiceType"("serviceType", "createdAt") VALUES ('TIP', now());	

SELECT setval('service."ServiceType_serviceTypeID_seq"', (SELECT MAX("serviceTypeID") FROM service."ServiceType"));  