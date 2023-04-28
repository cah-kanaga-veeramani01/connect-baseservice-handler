-- Table: service.SQSMessageDetails
DROP TABLE IF EXISTS service."SQSMessageDetails";
CREATE SEQUENCE IF NOT EXISTS service."SQSMessageDetails_sqsMessageDetailsId_seq";
DROP TYPE IF EXISTS service."enum_SQSMessageDetails_status";
CREATE TYPE service."enum_SQSMessageDetails_status" AS ENUM ('RECEIVED', 'IN PROCESS', 'PROCESSED');
CREATE TABLE IF NOT EXISTS service."SQSMessageDetails" (
    "sqsMessageDetailsId" integer NOT NULL DEFAULT nextval(
        'service."SQSMessageDetails_sqsMessageDetailsId_seq"'::regclass
    ),
    "messageId" character varying(255) COLLATE pg_catalog."default",
    "sequenceNumber" character varying(255) COLLATE pg_catalog."default",
    message json,
    status service."enum_SQSMessageDetails_status",
    "eventType" character varying(255) COLLATE pg_catalog."default",
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    CONSTRAINT "SQSMessageDetails_pkey" PRIMARY KEY ("sqsMessageDetailsId")
) TABLESPACE pg_default;
ALTER TABLE service."SQSMessageDetails" OWNER to pcdb_admin;
GRANT ALL ON TABLE service."SQSMessageDetails" TO pcdb_admin;
GRANT DELETE,
    UPDATE,
    INSERT,
    SELECT ON TABLE service."SQSMessageDetails" TO pcdb_dml;
GRANT ALL ON SEQUENCE service."SQSMessageDetails_sqsMessageDetailsId_seq" TO pcdb_admin;
GRANT ALL ON SEQUENCE service."SQSMessageDetails_sqsMessageDetailsId_seq" TO pcdb_dml;