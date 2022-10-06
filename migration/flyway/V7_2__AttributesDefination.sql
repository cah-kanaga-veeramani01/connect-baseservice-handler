DROP TABLE IF EXISTS service."AttributesDefinition" CASCADE;

CREATE SEQUENCE IF NOT EXISTS service."AttributesDefinition_attributesDefinitionID_seq";

DROP TYPE IF EXISTS service."enum_AttributesDefinition_categoryName";

CREATE TYPE service."enum_AttributesDefinition_categoryName" AS ENUM ('MEASURE');

CREATE TABLE service."AttributesDefinition"
(
    "attributesDefinitionID" integer NOT NULL DEFAULT nextval('"AttributesDefinition_attributesDefinitionID_seq"'::regclass),
    name character varying(255) COLLATE pg_catalog."default",
    description character varying(255) COLLATE pg_catalog."default",
    "categoryName" "enum_AttributesDefinition_categoryName",
    "createdAt" timestamp with time zone DEFAULT now(),
    "updatedAt" timestamp with time zone,
    CONSTRAINT "AttributesDefinition_pkey" PRIMARY KEY ("attributesDefinitionID")
)

TABLESPACE pg_default;

ALTER TABLE service."AttributesDefinition"
    OWNER to pcdb_admin;

GRANT ALL ON TABLE service."AttributesDefinition" TO pcdb_admin;

GRANT DELETE, UPDATE, INSERT, SELECT ON TABLE service."AttributesDefinition" TO pcdb_dml;