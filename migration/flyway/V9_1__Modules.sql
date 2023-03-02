-- Table: service.Modules

-- DROP TABLE service."Modules";

CREATE SEQUENCE IF NOT EXISTS service."Modules_moduleID_seq";

ALTER SEQUENCE service."Modules_moduleID_seq"
    OWNER TO pcdb_admin;

GRANT ALL ON SEQUENCE service."Modules_moduleID_seq" TO pcdb_admin;

GRANT ALL ON SEQUENCE service."Modules_moduleID_seq" TO pcdb_dml;

CREATE TABLE IF NOT EXISTS service."Modules"
(
    "moduleID" integer NOT NULL DEFAULT nextval('service."Modules_moduleID_seq"'::regclass),
    "moduleName" character(100) COLLATE pg_catalog."default" NOT NULL,
    "isMandatory" boolean DEFAULT false,
    CONSTRAINT "Modules_pkey" PRIMARY KEY ("moduleID")
)

TABLESPACE pg_default;

ALTER TABLE service."Modules"
    OWNER to pcdb_admin;

GRANT ALL ON TABLE service."Modules" TO pcdb_admin;

GRANT DELETE, UPDATE, INSERT, SELECT ON TABLE service."Modules" TO pcdb_dml;

INSERT INTO service."Modules"( "moduleName", "isMandatory")
    VALUES ( 'Base Service Info', true);