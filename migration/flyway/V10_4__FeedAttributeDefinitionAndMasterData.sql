DELETE FROM service."AttributesDefinition";
DELETE FROM service."AttributesMaster";

DROP TYPE IF EXISTS service."enum_AttributesDefinition_categoryName" CASCADE;

CREATE TYPE service."enum_AttributesDefinition_categoryName" AS ENUM ('Role', 'Class', 'Group');

ALTER TABLE service."AttributesDefinition"
ADD COLUMN "categoryName" service."enum_AttributesDefinition_categoryName";

INSERT INTO service."AttributesDefinition"("attributesDefinitionID", name, "categoryName", description ) VALUES(1,'TECHELIGIBLE','Role', 'Technicians Allowed to Work') ON CONFLICT DO NOTHING;

INSERT INTO service."AttributesDefinition"("attributesDefinitionID", name, "categoryName", description ) VALUES(2,'AMP','Class', 'Adherence Monitoring Program') ON CONFLICT DO NOTHING;
INSERT INTO service."AttributesDefinition"("attributesDefinitionID", name, "categoryName", description ) VALUES(3,'COSTALT','Class', 'Cost-Effective Alternative') ON CONFLICT DO NOTHING;
INSERT INTO service."AttributesDefinition"("attributesDefinitionID", name, "categoryName", description ) VALUES(4,'HIGHRISK','Class', 'High Risk Medication') ON CONFLICT DO NOTHING;
INSERT INTO service."AttributesDefinition"("attributesDefinitionID", name, "categoryName", description ) VALUES(5,'NDSE','Class', 'Needs Disease State Education') ON CONFLICT DO NOTHING;
INSERT INTO service."AttributesDefinition"("attributesDefinitionID", name, "categoryName", description ) VALUES(6,'NPE','Class', 'Needs Patient Education') ON CONFLICT DO NOTHING;

INSERT INTO service."AttributesDefinition"("attributesDefinitionID", name, "categoryName", description ) VALUES(7,'ESSENTIAL','Group', 'Essential') ON CONFLICT DO NOTHING;
INSERT INTO service."AttributesDefinition"("attributesDefinitionID", name, "categoryName", description ) VALUES(8,'LEGACY','Group', 'Legacy') ON CONFLICT DO NOTHING;
INSERT INTO service."AttributesDefinition"("attributesDefinitionID", name, "categoryName", description ) VALUES(9,'MEDREC','Group', 'Medrec') ON CONFLICT DO NOTHING;
INSERT INTO service."AttributesDefinition"("attributesDefinitionID", name, "categoryName", description ) VALUES(10,'STAR','Group', 'Star') ON CONFLICT DO NOTHING;

INSERT INTO service."AttributesMaster"("attributesMasterID", "serviceType", metadata, "createdAt") VALUES (1, 'TIP', '{"attributes":[1,2,3,4,5,6,7,8,9,10]}', now()) ON CONFLICT DO NOTHING;