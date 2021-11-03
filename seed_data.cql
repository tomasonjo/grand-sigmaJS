// constraints

CREATE CONSTRAINT IF NOT EXISTS ON (a:Airport) ASSERT a.name IS UNIQUE;

// import route data

USING PERIODIC COMMIT
LOAD CSV WITH HEADERS FROM "file:///routes.csv" as row
MERGE (s:Airport {name: row.` source airport`})
MERGE (t:Airport {name: row.` destination apirport`})
WITH s,t,count(*) as weight
MERGE (s)-[r:ROUTE]->(t)
SET r.weight = weight;

// import enrichment data

LOAD CSV FROM "https://raw.githubusercontent.com/jpatokal/openflights/master/data/airports.dat" as row
MATCH (a:Airport {name:row[4]})
SET a.fullName = row[1], a.country = row[3], a.latitude = toFloat(row[6]), a.longitude=toFloat(row[7]);

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