DROP TABLE IF EXISTS service."AttributesMaster" CASCADE;

DROP TYPE IF EXISTS service."enum_AttributesMaster_serviceType";

CREATE TYPE service."enum_AttributesMaster_serviceType" AS ENUM ('TIP','CMR');

CREATE SEQUENCE IF NOT EXISTS service."AttributesMaster_attributesMasterID_seq";

CREATE TABLE service."AttributesMaster"
(
    "attributesMasterID" integer NOT NULL DEFAULT nextval('"AttributesMaster_attributesMasterID_seq"'::regclass),
    "serviceType" service."enum_AttributesMaster_serviceType",
    metadata json,
    "createdAt" timestamp with time zone DEFAULT now(),
    "updatedAt" timestamp with time zone,
    CONSTRAINT "AttributesMaster_pkey" PRIMARY KEY ("attributesMasterID")
)

TABLESPACE pg_default;

ALTER TABLE service."AttributesMaster"
    OWNER to pcdb_admin;

GRANT ALL ON TABLE service."AttributesMaster" TO pcdb_admin;

GRANT DELETE, UPDATE, INSERT, SELECT ON TABLE service."AttributesMaster" TO pcdb_dml;