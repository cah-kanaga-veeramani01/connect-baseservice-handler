INSERT INTO service."AttributesDefinition"("attributesDefinitionID", name, "categoryName") VALUES(1,'STAR','MEASURE') ON CONFLICT DO NOTHING;
INSERT INTO service."AttributesDefinition"("attributesDefinitionID", name, "categoryName") VALUES(2,'COST','MEASURE') ON CONFLICT DO NOTHING;
INSERT INTO service."AttributesDefinition"("attributesDefinitionID", name, "categoryName") VALUES(3,'QUALITY','MEASURE') ON CONFLICT DO NOTHING;

INSERT INTO service."AttributesMaster"("attributesMasterID", "marketType", metadata, "createdAt") VALUES (1, 'TIP', '{"attributes":[1,2,3]}', now()) ON CONFLICT DO NOTHING;

