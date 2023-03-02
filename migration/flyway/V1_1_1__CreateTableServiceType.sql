-- SEQUENCE: service.ServiceType_serviceTypeID_seq

-- DROP SEQUENCE service."ServiceType_serviceTypeID_seq";

CREATE SEQUENCE IF NOT EXISTS service."ServiceType_serviceTypeID_seq"
    INCREMENT 1
    START 1
    MINVALUE 1
    MAXVALUE 2147483647
    CACHE 1;

ALTER SEQUENCE service."ServiceType_serviceTypeID_seq"
    OWNER TO pcdb_admin;

GRANT ALL ON SEQUENCE service."ServiceType_serviceTypeID_seq" TO pcdb_admin;

GRANT ALL ON SEQUENCE service."ServiceType_serviceTypeID_seq" TO pcdb_dml;

-- Table: service.ServiceType

-- DROP TABLE service."ServiceType";

CREATE TABLE IF NOT EXISTS service."ServiceType"
(
    "serviceTypeID" integer NOT NULL DEFAULT nextval('service."ServiceType_serviceTypeID_seq"'::regclass),
    "serviceType" character varying(255) COLLATE pg_catalog."default",
    "createdAt" timestamp with time zone DEFAULT now(),
    "createdBy" character varying(255) COLLATE pg_catalog."default",
    "updatedAt" timestamp with time zone DEFAULT now(),
    "updatedBy" character varying(255) COLLATE pg_catalog."default",
    CONSTRAINT "ServiceType_pkey" PRIMARY KEY ("serviceTypeID")
)
WITH (
    OIDS = FALSE
)
TABLESPACE pg_default;

ALTER TABLE service."ServiceType"
    OWNER to pcdb_admin;

GRANT ALL ON TABLE service."ServiceType" TO pcdb_admin;

GRANT DELETE, UPDATE, INSERT, SELECT ON TABLE service."ServiceType" TO pcdb_dml;