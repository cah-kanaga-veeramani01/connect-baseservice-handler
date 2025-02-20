/**
* Service Attribute cleanup
**/

DELETE FROM service."AttributesDefinition"
WHERE "attributesDefinitionID"!=1;


CREATE TYPE service."new_enum_categoryName" AS ENUM('Role','Sponsor Type','TIP Reason','Origin','TIP Type','Opportunity Type','Quality Measures');

ALTER TABLE service."AttributesDefinition"
    ALTER COLUMN "categoryName"
    SET DATA TYPE service."new_enum_categoryName"
        USING "categoryName"::text::service."new_enum_categoryName";

DROP TYPE service."enum_AttributesDefinition_categoryName";

ALTER TYPE service."new_enum_categoryName" RENAME TO "enum_AttributesDefinition_categoryName";


INSERT INTO service."AttributesDefinition"(name, description, "createdAt", "categoryName") VALUES ('PAYER','Services grouped as payer targeted',now(),'Sponsor Type');
INSERT INTO service."AttributesDefinition"(name, description, "createdAt", "categoryName") VALUES ('PHARMA','Services grouped as pharma targeted',now(),'Sponsor Type');
INSERT INTO service."AttributesDefinition"(name, description, "createdAt", "categoryName") VALUES ('PHARMACY','Services grouped as pharmacy targeted',now(),'Sponsor Type');
INSERT INTO service."AttributesDefinition"(name, description, "createdAt", "categoryName") VALUES ('ADHERENCE - NEEDS 90-DAY FILL','Adherence - Needs 90-day Fill and Adherence - Needs Check-in + 90-day Fill TIPs',now(),'TIP Reason');
INSERT INTO service."AttributesDefinition"(name, description, "createdAt", "categoryName") VALUES ('ADHERENCE - NEEDS 100-DAY FILL','Adherence - Needs 100-day Fill and Adherence - Needs Check-in + 100-day Fill TIPs',now(),'TIP Reason');
INSERT INTO service."AttributesDefinition"(name, description, "createdAt", "categoryName") VALUES ('ADHERENCE - NEEDS CHECK-IN','Adherence - Needs Check-in TIPs',now(),'TIP Reason');
INSERT INTO service."AttributesDefinition"(name, description, "createdAt", "categoryName") VALUES ('ADHERENCE MONITORING','Adherence Monitoring Enrollment TIPs',now(),'TIP Reason');
INSERT INTO service."AttributesDefinition"(name, description, "createdAt", "categoryName") VALUES ('ADHERENCE MONITORING CHECKPOINT','Adherence Monitoring Checkpoint TIPs',now(),'TIP Reason');
INSERT INTO service."AttributesDefinition"(name, description, "createdAt", "categoryName") VALUES ('COST-EFFECTIVE ALTERNATIVE','Cost-effective Alternative TIPs',now(),'TIP Reason');
INSERT INTO service."AttributesDefinition"(name, description, "createdAt", "categoryName") VALUES ('DRUG INTERACTION','Drug Interaction TIPs',now(),'TIP Reason');
INSERT INTO service."AttributesDefinition"(name, description, "createdAt", "categoryName") VALUES ('HIGH RISK MEDICATION TIPS','High Risk Medication TIPs',now(),'TIP Reason');
INSERT INTO service."AttributesDefinition"(name, description, "createdAt", "categoryName") VALUES ('NEEDS DISEASE STATE EDUCATION','Needs Disease State Education',now(),'TIP Reason');
INSERT INTO service."AttributesDefinition"(name, description, "createdAt", "categoryName") VALUES ('NEEDS DRUG THERAPY','Needs Drug Therapy TIPs',now(),'TIP Reason');
INSERT INTO service."AttributesDefinition"(name, description, "createdAt", "categoryName") VALUES ('NEEDS FIRST MEDICATION FILL','Needs First Medication Fill TIPs',now(),'TIP Reason');
INSERT INTO service."AttributesDefinition"(name, description, "createdAt", "categoryName") VALUES ('NEEDS IMMUNIZATION','Needs Immunization TIPs',now(),'TIP Reason');
INSERT INTO service."AttributesDefinition"(name, description, "createdAt", "categoryName") VALUES ('NEEDS LAB MONITORING OR HEALTH TEST','Needs Lab Monitoring TIPs',now(),'TIP Reason');
INSERT INTO service."AttributesDefinition"(name, description, "createdAt", "categoryName") VALUES ('NEEDS MEDICATION ASSESSMENT','Needs Medication Assessment TIPs',now(),'TIP Reason');
INSERT INTO service."AttributesDefinition"(name, description, "createdAt", "categoryName") VALUES ('NEEDS PATIENT EDUCATION','Needs Patient Education category of TIPs',now(),'TIP Reason');
INSERT INTO service."AttributesDefinition"(name, description, "createdAt", "categoryName") VALUES ('NEEDS REFILL','Needs Refill category of TIPs',now(),'TIP Reason');
INSERT INTO service."AttributesDefinition"(name, description, "createdAt", "categoryName") VALUES ('NEW THERAPY CONSULTATION','New Therapy Consultation TIPs',now(),'TIP Reason');
INSERT INTO service."AttributesDefinition"(name, description, "createdAt", "categoryName") VALUES ('SOCIAL DETERMINANTS OF HEALTH','Social Determinants of Health TIPs',now(),'TIP Reason');
INSERT INTO service."AttributesDefinition"(name, description, "createdAt", "categoryName") VALUES ('SUBOPTIMAL DRUG','Suboptimal Drug TIPs',now(),'TIP Reason');
INSERT INTO service."AttributesDefinition"(name, description, "createdAt", "categoryName") VALUES ('INSIGHT','Insight-generated TIPs',now(),'Origin');
INSERT INTO service."AttributesDefinition"(name, description, "createdAt", "categoryName") VALUES ('DIRECT','Direct TIPs',now(),'Origin');
INSERT INTO service."AttributesDefinition"(name, description, "createdAt", "categoryName") VALUES ('COST','Cost TIPs',now(),'TIP Type');
INSERT INTO service."AttributesDefinition"(name, description, "createdAt", "categoryName") VALUES ('QUALITY','Quality TIPs',now(),'TIP Type');
INSERT INTO service."AttributesDefinition"(name, description, "createdAt", "categoryName") VALUES ('STAR','Star TIPs',now(),'TIP Type');
INSERT INTO service."AttributesDefinition"(name, description, "createdAt", "categoryName") VALUES ('TASK','Pharmacy-sponsored services',now(),'Opportunity Type');
INSERT INTO service."AttributesDefinition"(name, description, "createdAt", "categoryName") VALUES ('TIP','Non-pharmacy-sponsored services',now(),'Opportunity Type');
INSERT INTO service."AttributesDefinition"(name, description, "createdAt", "categoryName") VALUES ('CHOLESTEROL (STATIN) ADHERENCE','Cholesterol program support',now(),'Quality Measures');
INSERT INTO service."AttributesDefinition"(name, description, "createdAt", "categoryName") VALUES ('DIABETES (ALL CLASS) ADHERENCE','Diabetes program support',now(),'Quality Measures');
INSERT INTO service."AttributesDefinition"(name, description, "createdAt", "categoryName") VALUES ('HYPERTENSION (RASA) ADHERENCE','Hypertension program support',now(),'Quality Measures');
INSERT INTO service."AttributesDefinition"(name, description, "createdAt", "categoryName") VALUES ('STATIN USE IN DIABETES (SUPD)','Statin in Diabetes program support',now(),'Quality Measures');

UPDATE service."AttributesMaster"
	SET "metadata"=
	(SELECT json_build_object('attributes', (select json_agg("attributesDefinitionID") from service."AttributesDefinition")::JSON))
	WHERE "attributesMasterID"=1;
