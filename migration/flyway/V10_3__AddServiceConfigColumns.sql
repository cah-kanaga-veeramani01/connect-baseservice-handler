ALTER TABLE service."ServiceModuleConfig" ADD COLUMN  "createdAt" timestamp with time zone;
ALTER TABLE service."ServiceModuleConfig" ADD COLUMN  "createdBy" character varying(100) COLLATE pg_catalog."default";
ALTER TABLE service."ServiceModuleConfig" ADD COLUMN  "updatedAt" timestamp with time zone;
ALTER TABLE service."ServiceModuleConfig" ADD COLUMN  "updatedBy" character varying(100) COLLATE pg_catalog."default";

ALTER TABLE service."Modules" ALTER COLUMN  "moduleName" TYPE character varying(100);
