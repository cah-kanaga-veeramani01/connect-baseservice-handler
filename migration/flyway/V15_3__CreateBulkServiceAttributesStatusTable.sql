CREATE TYPE service."enum_BulkServiceAttributes_status" AS ENUM ('INPROGRESS','COMPLETED', 'FAILED');

CREATE SEQUENCE IF NOT EXISTS service."Service_bulkServiceAttributesStatusID_seq"
    INCREMENT 1
    START 1
    MINVALUE 1
    MAXVALUE 2147483647
    CACHE 1;

ALTER SEQUENCE service."Service_bulkServiceAttributesStatusID_seq"
    OWNER TO pcdb_admin;

GRANT ALL ON SEQUENCE service."Service_bulkServiceAttributesStatusID_seq" TO pcdb_admin;

GRANT ALL ON SEQUENCE service."Service_bulkServiceAttributesStatusID_seq" TO pcdb_dml;

-- Table: service.BulkServiceAttributesStatus

-- DROP TABLE service."BulkServiceAttributesStatus";

CREATE TABLE IF NOT EXISTS service."BulkServiceAttributesStatus"
(
    "bulkServiceAttributesStatusID" integer NOT NULL DEFAULT nextval('service."Service_bulkServiceAttributesStatusID_seq"'::regclass),
    "fileName" character varying(255) NOT NULL,
    "totalRecords" integer NOT NULL,
    "successfullyProcessedRecords" integer,
    "totalFailedRecords" integer,
    "errorReason" jsonb,
    "filelocation" character varying(500),
    "status" service."enum_BulkServiceAttributes_status",
    "createdAt" timestamp with time zone DEFAULT now(),
    "createdBy" character varying(255) COLLATE pg_catalog."default",
    "updatedAt" timestamp with time zone DEFAULT now(),
    "updatedBy" character varying(255) COLLATE pg_catalog."default",
    CONSTRAINT "Service_bulkServiceAttributesStatusID_pkey" PRIMARY KEY ("bulkServiceAttributesStatusID")
)
WITH (
    OIDS = FALSE
)
TABLESPACE pg_default;

ALTER TABLE service."BulkServiceAttributesStatus"
    OWNER to pcdb_admin;

GRANT ALL ON TABLE service."BulkServiceAttributesStatus" TO pcdb_admin;

GRANT DELETE, UPDATE, INSERT, SELECT ON TABLE service."BulkServiceAttributesStatus" TO pcdb_dml;