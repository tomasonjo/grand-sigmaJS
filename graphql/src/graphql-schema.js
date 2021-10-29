export const typeDefs = `
type HCO @exclude(operations: [CREATE, UPDATE, DELETE]){
    Name: String
    number_treating: Int
    incoming_referral: [HCO] @relationship(type: "REFERRAL", direction: IN)
    outgoing_referral: [HCO] @relationship(type: "REFERRAL", direction: OUT)
}

type Query{
    characterSearch(search: String):[HCO] @cypher(statement:"""
        CALL db.index.fulltext.queryNodes('HCPSearch', $search + '*') YIELD node
        RETURN node LIMIT 5
    """)
}
`;