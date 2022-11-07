-- Type: enum_Service_status

-- DROP TYPE service."enum_Service_status";

CREATE TYPE service."enum_Service_status" AS ENUM
    ('ACTIVE', 'DRAFT', 'SCHEDULED', 'INACTIVE');

ALTER TYPE service."enum_Service_status"
    OWNER TO pcdb_admin;

-- Table: service.ServiceModuleConfig

-- DROP TABLE service."ServiceModuleConfig";

CREATE SEQUENCE IF NOT EXISTS service."ServiceModuleConfig_serviceModuleConfigID_seq";


CREATE TABLE IF NOT EXISTS service."ServiceModuleConfig"
(
    "serviceModuleConfigID" integer NOT NULL DEFAULT nextval('service."ServiceModuleConfig_serviceModuleConfigID_seq"'::regclass),
    "serviceID" integer,
    "moduleID" integer,
    "moduleVersion" integer,
    status service."enum_Service_status",
    CONSTRAINT "ServiceModuleConfig_pkey" PRIMARY KEY ("serviceModuleConfigID"),
    CONSTRAINT "ServiceModuleConfig_moduleID_fkey" FOREIGN KEY ("moduleID")
        REFERENCES service."Modules" ("moduleID") MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
        NOT VALID,
    CONSTRAINT "ServiceModuleConfig_serviceID_moduleVersion_fkey" FOREIGN KEY ("moduleVersion", "serviceID")
        REFERENCES service."Service" ("globalServiceVersion", "serviceID") MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
        NOT VALID
)

TABLESPACE pg_default;

ALTER TABLE service."ServiceModuleConfig"
    OWNER to pcdb_admin;

GRANT ALL ON TABLE service."ServiceModuleConfig" TO pcdb_admin;

GRANT DELETE, UPDATE, INSERT, SELECT ON TABLE service."ServiceModuleConfig" TO pcdb_dml;