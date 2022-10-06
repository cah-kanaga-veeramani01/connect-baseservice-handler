DROP TABLE IF EXISTS service."ServiceTag" CASCADE;

DROP TABLE IF EXISTS service."ServiceTagHistories" CASCADE;

DROP TABLE IF EXISTS service."ServiceTagMapping" CASCADE;

DROP TABLE IF EXISTS service."ServiceTagMappingHistories" CASCADE;

DROP TABLE IF EXISTS service."AttributesDefinitionHistories" CASCADE;

DROP TABLE IF EXISTS service."AttributesMasterHistories" CASCADE;

DROP TABLE IF EXISTS service."BaseServiceAttributesHistories" CASCADE;

DROP TYPE IF EXISTS service."enum_AttributesMasterHistories_serviceType";

DROP TYPE IF EXISTS service."enum_AttributesDefinitionHistories_categoryName";

ALTER TABLE service."Service" DROP COLUMN IF EXISTS "serviceType" CASCADE;