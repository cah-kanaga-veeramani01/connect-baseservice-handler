--  user "postgres" is the owner of postgres(database) and public(schema)
CREATE SCHEMA service; -- create a new schema whose owner is also postgres

GRANT ALL ON SCHEMA service TO pcdb_admin; -- grant ALL(USAGE, CREATE) to pcdb_admin

GRANT USAGE ON SCHEMA service TO pcdb_dml; -- grant USAGE to pcdb_dml, does not have the CREATE access

ALTER DEFAULT PRIVILEGES IN SCHEMA service GRANT INSERT, SELECT, UPDATE, DELETE ON TABLES TO pcdb_dml; -- CRUD operations

ALTER DEFAULT PRIVILEGES IN SCHEMA service GRANT ALL ON SEQUENCES TO pcdb_dml; -- allows the use of the currval and nextval functions

-- after the tables are set, we need to add the inter schema foreign key constraint
-- ALTER TABLE public."ProgramServices" ADD CONSTRAINT ProgramServices_BaseService_FKey FOREIGN KEY ("serviceID") REFERENCES service."Service"("serviceID");
--GRANT INSERT, SELECT, UPDATE, DELETE ON ALL TABLES IN SCHEMA service TO pcdb_dml;
--GRANT ALL ON ALL SEQUENCES IN SCHEMA service TO pcdb_dml;