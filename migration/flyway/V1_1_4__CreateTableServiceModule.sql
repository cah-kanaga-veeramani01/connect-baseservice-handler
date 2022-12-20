-- SEQUENCE: service.ServiceModule_moduleID_seq

-- DROP SEQUENCE service."ServiceModule_moduleID_seq";

CREATE SEQUENCE service."ServiceModule_moduleID_seq"
    INCREMENT 1
    START 1
    MINVALUE 1
    MAXVALUE 2147483647
    CACHE 1;

ALTER SEQUENCE service."ServiceModule_moduleID_seq"
    OWNER TO pcdb_admin;

GRANT ALL ON SEQUENCE service."ServiceModule_moduleID_seq" TO pcdb_admin;

GRANT ALL ON SEQUENCE service."ServiceModule_moduleID_seq" TO pcdb_dml;

-- Table: service.ServiceModule

-- DROP TABLE service."ServiceModule";

CREATE TABLE IF NOT EXISTS service."ServiceModule"
(
    "moduleID" integer NOT NULL DEFAULT nextval('service."ServiceModule_moduleID_seq"'::regclass),
    "moduleName" character varying(255) COLLATE pg_catalog."default",
    "createdAt" timestamp with time zone NOT NULL,
    "updatedAt" timestamp with time zone NOT NULL,
    CONSTRAINT "ServiceModule_pkey" PRIMARY KEY ("moduleID")
)
WITH (
    OIDS = FALSE
)
TABLESPACE pg_default;

ALTER TABLE service."ServiceModule"
    OWNER to pcdb_admin;

GRANT ALL ON TABLE service."ServiceModule" TO pcdb_admin;

GRANT DELETE, UPDATE, INSERT, SELECT ON TABLE service."ServiceModule" TO pcdb_dml;