-- Table: service.ServiceTypeModule

-- DROP TABLE service."ServiceTypeModule";

CREATE SEQUENCE IF NOT EXISTS service."ServiceTypeModule_serviceTypeModuleID_seq";


CREATE TABLE IF NOT EXISTS service."ServiceTypeModule"
(
    "serviceTypeModuleID" integer NOT NULL DEFAULT nextval('service."ServiceTypeModule_serviceTypeModuleID_seq"'::regclass),
    "serviceTypeID" integer,
    "moduleID" integer,
    CONSTRAINT "ServiceTypeModule_pkey" PRIMARY KEY ("serviceTypeModuleID"),
    CONSTRAINT "ServiceTypeModule_moduleID_fkey" FOREIGN KEY ("moduleID")
        REFERENCES service."Modules" ("moduleID") MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
        NOT VALID,
    CONSTRAINT "ServiceTypeModule_serviceTypeID_fkey" FOREIGN KEY ("serviceTypeID")
        REFERENCES service."ServiceType" ("serviceTypeID") MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
        NOT VALID
)

TABLESPACE pg_default;

ALTER TABLE service."ServiceTypeModule"
    OWNER to pcdb_admin;

GRANT ALL ON TABLE service."ServiceTypeModule" TO pcdb_admin;

GRANT DELETE, UPDATE, INSERT, SELECT ON TABLE service."ServiceTypeModule" TO pcdb_dml;