DROP TABLE IF EXISTS service."BaseServiceAttributes" CASCADE;

CREATE SEQUENCE IF NOT EXISTS service."ServiceAttributes_serviceAttributesID_seq";

CREATE TABLE service."ServiceAttributes"
(
    "serviceAttributesID" integer NOT NULL DEFAULT nextval('"ServiceAttributes_serviceAttributesID_seq"'::regclass),
    metadata json,
    "serviceID" integer,
    "globalServiceVersion" integer,
    "createdAt" timestamp with time zone DEFAULT now(),
    "createdBy" character varying(100) COLLATE pg_catalog."default",
    "updatedAt" timestamp with time zone DEFAULT now(),
    "updatedBy" character varying(100) COLLATE pg_catalog."default",
    CONSTRAINT "ServiceAttributes_pkey" PRIMARY KEY ("serviceAttributesID"),
    CONSTRAINT "ServiceAttributes_serviceID_globalServiceVersion_fkey" FOREIGN KEY ("globalServiceVersion", "serviceID")
        REFERENCES service."Service" ("globalServiceVersion", "serviceID") MATCH SIMPLE
        ON UPDATE CASCADE
        ON DELETE CASCADE
)

TABLESPACE pg_default;

ALTER TABLE service."ServiceAttributes"
    OWNER to pcdb_admin;

GRANT ALL ON TABLE service."ServiceAttributes" TO pcdb_admin;

GRANT DELETE, UPDATE, INSERT, SELECT ON TABLE service."ServiceAttributes" TO pcdb_dml;