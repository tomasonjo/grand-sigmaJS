export const typeDefs = `
type Airport @exclude(operations: [CREATE, UPDATE, DELETE]){
    name: String
    pagerank: Float
    louvain: Int
    fullName: String
    country: String
    latitude: Float
    longitude: Float
    incoming_routes: [Airport] @relationship(type: "ROUTE", properties: "Route", direction: IN)
    outgoing_routes: [Airport] @relationship(type: "ROUTE", properties: "Route", direction: OUT)
}
interface Route @relationshipProperties {
    weight: Float
}
`;