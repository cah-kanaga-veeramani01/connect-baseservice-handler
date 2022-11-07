INSERT INTO service."AttributesDefinition"("attributesDefinitionID", name, "categoryName") VALUES(1,'STAR','MEASURE') ON CONFLICT DO NOTHING;
INSERT INTO service."AttributesDefinition"("attributesDefinitionID", name, "categoryName") VALUES(2,'COST','MEASURE') ON CONFLICT DO NOTHING;
INSERT INTO service."AttributesDefinition"("attributesDefinitionID", name, "categoryName") VALUES(3,'QUALITY','MEASURE') ON CONFLICT DO NOTHING;

INSERT INTO service."AttributesMaster"("attributesMasterID", "serviceType", metadata, "createdAt") VALUES (1, 'TIP', '{"attributes":[1,2,3]}', now()) ON CONFLICT DO NOTHING;

