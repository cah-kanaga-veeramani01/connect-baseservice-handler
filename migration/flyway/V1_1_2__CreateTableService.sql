-- SEQUENCE: service.Service_serviceID_seq

-- DROP SEQUENCE service."Service_serviceID_seq";

CREATE SEQUENCE IF NOT EXISTS service."Service_serviceID_seq"
    INCREMENT 1
    START 1
    MINVALUE 1
    MAXVALUE 2147483647
    CACHE 1;

ALTER SEQUENCE service."Service_serviceID_seq"
    OWNER TO pcdb_admin;

GRANT ALL ON SEQUENCE service."Service_serviceID_seq" TO pcdb_admin;

GRANT ALL ON SEQUENCE service."Service_serviceID_seq" TO pcdb_dml;

-- Table: service.Service

-- DROP TABLE service."Service";

CREATE TABLE IF NOT EXISTS service."Service"
(
    "serviceID" integer NOT NULL DEFAULT nextval('service."Service_serviceID_seq"'::regclass),
    "serviceName" character varying(255) COLLATE pg_catalog."default",
    "serviceDisplayName" character varying(255) COLLATE pg_catalog."default",
    "globalServiceVersion" integer NOT NULL,
    "validFrom" timestamp with time zone,
    "validTill" timestamp with time zone,
    "isPublished" integer NOT NULL,
    "serviceTypeID" integer,
    "createdAt" timestamp with time zone DEFAULT now(),
    "createdBy" character varying(255) COLLATE pg_catalog."default",
    "updatedAt" timestamp with time zone DEFAULT now(),
    "updatedBy" character varying(255) COLLATE pg_catalog."default",
    "legacyTIPDetailID" integer,
    CONSTRAINT "Service_pkey" PRIMARY KEY ("serviceID", "globalServiceVersion"),
    CONSTRAINT "Service_serviceTypeID_fkey" FOREIGN KEY ("serviceTypeID")
        REFERENCES service."ServiceType" ("serviceTypeID") MATCH SIMPLE
        ON UPDATE CASCADE
        ON DELETE NO ACTION
)
WITH (
    OIDS = FALSE
)
TABLESPACE pg_default;

ALTER TABLE service."Service"
    OWNER to pcdb_admin;

GRANT ALL ON TABLE service."Service" TO pcdb_admin;

GRANT DELETE, UPDATE, INSERT, SELECT ON TABLE service."Service" TO pcdb_dml;