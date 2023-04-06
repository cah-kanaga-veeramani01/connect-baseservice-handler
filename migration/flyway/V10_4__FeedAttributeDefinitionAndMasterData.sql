DELETE FROM service."AttributesDefinition";
DELETE FROM service."AttributesMaster"

DROP TYPE IF EXISTS service."enum_AttributesDefinition_categoryName" CASCADE;

CREATE TYPE service."enum_AttributesDefinition_categoryName" AS ENUM ('Role', 'Class', 'Group');

ALTER TABLE service."AttributesDefinition"
ADD COLUMN "categoryName" service."enum_AttributesDefinition_categoryName";


INSERT INTO service."AttributesDefinition"("attributesDefinitionID", name, "categoryName") VALUES(1,'TECHELIGIBLE','Role') ON CONFLICT DO NOTHING;

INSERT INTO service."AttributesDefinition"("attributesDefinitionID", name, "categoryName") VALUES(2,'AMP','Class') ON CONFLICT DO NOTHING;
INSERT INTO service."AttributesDefinition"("attributesDefinitionID", name, "categoryName") VALUES(3,'COSTALT','Class') ON CONFLICT DO NOTHING;
INSERT INTO service."AttributesDefinition"("attributesDefinitionID", name, "categoryName") VALUES(4,'HIGHRISK','Class') ON CONFLICT DO NOTHING;
INSERT INTO service."AttributesDefinition"("attributesDefinitionID", name, "categoryName") VALUES(5,'NDSE','Class') ON CONFLICT DO NOTHING;
INSERT INTO service."AttributesDefinition"("attributesDefinitionID", name, "categoryName") VALUES(6,'NPE','Class') ON CONFLICT DO NOTHING;

INSERT INTO service."AttributesDefinition"("attributesDefinitionID", name, "categoryName") VALUES(7,'ESSENTIAL','Group') ON CONFLICT DO NOTHING;
INSERT INTO service."AttributesDefinition"("attributesDefinitionID", name, "categoryName") VALUES(8,'LEGACY','Group') ON CONFLICT DO NOTHING;
INSERT INTO service."AttributesDefinition"("attributesDefinitionID", name, "categoryName") VALUES(9,'MEDREC','Group') ON CONFLICT DO NOTHING;
INSERT INTO service."AttributesDefinition"("attributesDefinitionID", name, "categoryName") VALUES(10,'STAR','Group') ON CONFLICT DO NOTHING;

INSERT INTO service."AttributesMaster"("attributesMasterID", "serviceType", metadata, "createdAt") VALUES (1, 'TIP', '{"attributes":[1,2,3,4,5,6,7,8,9,10]}', now()) ON CONFLICT DO NOTHING;
