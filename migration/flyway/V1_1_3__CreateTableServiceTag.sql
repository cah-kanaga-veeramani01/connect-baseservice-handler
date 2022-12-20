-- SEQUENCE: service.ServiceTag_serviceTagID_seq

-- DROP SEQUENCE service."ServiceTag_serviceTagID_seq";

CREATE SEQUENCE service."ServiceTag_serviceTagID_seq"
    INCREMENT 1
    START 1
    MINVALUE 1
    MAXVALUE 2147483647
    CACHE 1;

ALTER SEQUENCE service."ServiceTag_serviceTagID_seq"
    OWNER TO pcdb_admin;

GRANT ALL ON SEQUENCE service."ServiceTag_serviceTagID_seq" TO pcdb_admin;

GRANT ALL ON SEQUENCE service."ServiceTag_serviceTagID_seq" TO pcdb_dml;

-- Table: service.ServiceTag

-- DROP TABLE service."ServiceTag";

CREATE TABLE IF NOT EXISTS service."ServiceTag"
(
    "serviceTagID" integer NOT NULL DEFAULT nextval('service."ServiceTag_serviceTagID_seq"'::regclass),
    "serviceTagName" character varying(255) COLLATE pg_catalog."default",
    "serviceDisplayName" character varying(255) COLLATE pg_catalog."default",
    "createdAt" timestamp with time zone DEFAULT now(),
    "createdBy" character varying(255) COLLATE pg_catalog."default",
    "updatedAt" timestamp with time zone DEFAULT now(),
    "updatedBy" character varying(255) COLLATE pg_catalog."default",
    CONSTRAINT "ServiceTag_pkey" PRIMARY KEY ("serviceTagID")
)
WITH (
    OIDS = FALSE
)
TABLESPACE pg_default;

ALTER TABLE service."ServiceTag"
    OWNER to pcdb_admin;

GRANT ALL ON TABLE service."ServiceTag" TO pcdb_admin;

GRANT DELETE, UPDATE, INSERT, SELECT ON TABLE service."ServiceTag" TO pcdb_dml;