// constraints

CREATE CONSTRAINT ON (h:HCO) ASSERT h.name IS UNIQUE;

// import referral data

LOAD CSV WITH HEADERS FROM "file:///referral.csv" as row
WITH row
LIMIT 10000

WHERE row.REF_HCO_NAME IS NOT NULL AND row.HCO_NAME IS NOT NULL
// merge referrals
MERGE (source:HCO {Name:row.REF_HCO_NAME})
MERGE (target:HCO {Name:row.HCO_NAME})
MERGE (source)-[:REFERRAL]->(target);

// numbers

LOAD CSV WITH HEADERS FROM "file:///referral.csv" as row
WITH row
LIMIT 10000
WHERE row.REF_HCO_NAME IS NOT NULL AND row.HCO_NAME IS NOT NULL
MATCH (h:HCO{Name: row.HCO_NAME})
SET h.number_treating = coalesce(h.number_treating, 0) + toInteger(row.PATIENT_COUNT);

// remaining

MATCH (h:HCO)
WHERE NOT EXISTS (h.number_treating)
SET h.number_treating = 0;