// constraints

CREATE CONSTRAINT IF NOT EXISTS ON (a:Airport) ASSERT a.name IS UNIQUE;

// import referral data

USING PERIODIC COMMIT
LOAD CSV WITH HEADERS FROM "file:///routes.csv" as row
MERGE (s:Airport {name: row.` source airport`})
MERGE (t:Airport {name: row.` destination apirport`})
WITH s,t,count(*) as weight
MERGE (s)-[r:ROUTE]->(t)
SET r.weight = weight;

// pageRank

CALL gds.pageRank.write({
    nodeProjection:'Airport',
    relationshipProjection:'ROUTE',
    writeProperty:'pagerank'
});

// Louvain

CALL gds.louvain.write({
    nodeProjection:'Airport',
    relationshipProjection:'ROUTE',
    writeProperty:'louvain'
});