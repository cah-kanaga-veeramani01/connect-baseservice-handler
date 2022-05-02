-- ALTER TABLE IF EXISTS service."ServiceClass"
-- RENAME TO "ServiceTag";

-- ALTER TABLE service."ServiceTag"
-- DROP COLUMN IF EXISTS "serviceTypeID";

-- ALTER TABLE service."ServiceTag"
-- RENAME COLUMN "serviceClassID" TO "serviceTagID";

-- ALTER TABLE service."ServiceTag"
-- RENAME COLUMN "serviceClassName" TO "serviceTagName";

-- ALTER TABLE IF EXISTS service."ServiceClassHistories"
-- RENAME TO "ServiceTagHistories";

-- ALTER TABLE service."ServiceTagHistories"
-- DROP COLUMN "serviceTypeID";

-- ALTER TABLE service."ServiceTagHistories"
-- RENAME COLUMN "serviceClassID" TO "serviceTagID";

-- ALTER TABLE service."ServiceTagHistories"
-- RENAME COLUMN "serviceClassName" TO "serviceTagName";
