-- Table: service.ServiceTagMapping

-- DROP TABLE service."ServiceTagMapping";

CREATE SEQUENCE IF NOT EXISTS service."ServiceTagMapping_serviceTagMappingID_seq";

CREATE TABLE IF NOT EXISTS service."ServiceTagMapping"
(
    "serviceTagMappingID" integer NOT NULL DEFAULT nextval('service."ServiceTagMapping_serviceTagMappingID_seq"'::regclass),
    "serviceID" integer,
    "globalServiceVersion" integer,
    "serviceTagID" integer,
    "createdAt" timestamp with time zone DEFAULT now(),
    "createdBy" character varying(255) COLLATE pg_catalog."default",
    "updatedAt" timestamp with time zone DEFAULT now(),
    "updatedBy" character varying(255) COLLATE pg_catalog."default",
    CONSTRAINT "ServiceTagMapping_pkey" PRIMARY KEY ("serviceTagMappingID"),
    CONSTRAINT "ServiceTagMapping_serviceID_globalServiceVersion_fkey" FOREIGN KEY ("serviceID", "globalServiceVersion")
        REFERENCES service."Service" ("serviceID", "globalServiceVersion") MATCH SIMPLE
        ON UPDATE NO ACTION
        ON DELETE NO ACTION
        NOT VALID,
    CONSTRAINT "ServiceTagMapping_serviceTagID_fkey" FOREIGN KEY ("serviceTagID")
        REFERENCES service."ServiceTag" ("serviceTagID") MATCH SIMPLE
        ON UPDATE CASCADE
        ON DELETE NO ACTION
)
WITH (
    OIDS = FALSE
)
TABLESPACE pg_default;

ALTER TABLE service."ServiceTagMapping"
    OWNER to pcdb_admin;

GRANT INSERT, SELECT, UPDATE, DELETE ON ALL TABLES IN SCHEMA service TO pcdb_dml;
GRANT ALL ON ALL SEQUENCES IN SCHEMA service TO pcdb_dml;