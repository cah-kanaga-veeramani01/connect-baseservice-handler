ALTER TYPE service."enum_AttributesDefinition_categoryName" ADD VALUE IF NOT EXISTS 'Workflow Type';
ALTER TYPE service."enum_AttributesDefinition_categoryName" ADD VALUE IF NOT EXISTS 'TIP Reason';

INSERT INTO service."AttributesDefinition"("attributesDefinitionID",
	 name, description, "createdAt", "updatedAt", "categoryName")
	VALUES (32,'QUICK TIP', 'TIPs that run a short workflow', now(), now(), 'Workflow Type');

INSERT INTO service."AttributesDefinition"("attributesDefinitionID",
	 name, description, "createdAt", "updatedAt", "categoryName")
	VALUES (33,'ADHERENCE - NEEDS 100-DAY OR 90-DAY FILL', 'TIPs that leverage the Adherence - Needs 100-day or 90-day fill reason code/workflow', now(), now(), 'TIP Reason');

UPDATE service."AttributesMaster" SET metadata= '{"attributes":[1,2,3,4,5,6,7,8,9,10,11]}', "updatedAt"=now() WHERE "attributesMasterID" = 1;
	