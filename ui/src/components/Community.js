import { React, useState, useEffect } from "react";
import { gql, useQuery } from "@apollo/client";
import CircularProgress from "@material-ui/core/CircularProgress";
import Graph from "vis-react";

const HCP_QUERY = gql`
    query ExampleQuery {
    hcos(options: { limit: 500, sort: { number_treating: DESC } }) {
        Name
        number_treating
        incoming_referral {
        Name
        number_treating
        }
    }
    }
`;

const nodeCaption = (node) => {
    console.log(node)
    let captions = ['name', 'specialty', 'referral_count', 'referring_count'].map((row) => {
        return `<strong>${row}</strong> ${node[row]}<br>`
    })
    console.log(captions.join(""))
    return captions.join("")
}

const parseNodes = (data, isIncoming) => {
    let allNodes = new Set()
    data.map((el) => {
        allNodes.add(JSON.stringify({
            id: el.Name,
            label: el.Name,
        //    size: el.referral_count,
        //    title: nodeCaption(el)
        }))
        if (isIncoming) {
            el.incoming_referral.map((refs) => {
                allNodes.add(JSON.stringify({
                    id: refs.Name,
                    label: refs.Name,
               //     size: refs.number_treating,
                   // title: nodeCaption(refs.incoming_referral_hcp)
                }))
            })
        }
        else {

        }
    })

    return [...allNodes].map((el) => JSON.parse(el))
}

const parseRels = (data, isIncoming) => {
    let allRels = []
    data.map((el) => {
        if (isIncoming) {
            el.incoming_referral.map((refs) => {
                allRels.push({
                    from: refs.Name,
                    to: el.Name
                })
            })
        }
        else {

        }
    })
    
    return allRels
}

function Community() {
    // Fetch node and relationship data for our network visualization
    const { loading: dataLoading, data: hcpData } = useQuery(HCP_QUERY);
    const [graph, setGraph] = useState({ nodes: [], edges: [] });

    // Construct a VisJS object based on node and rel graphql responses
    useEffect(() => {
        if (hcpData) {
            setGraph({
                nodes: parseNodes(hcpData.hcos, true),
                edges: parseRels(hcpData.hcos, true),
                rand: Math.random().toString(),
            });
        }
    }, [hcpData]);

    if (dataLoading) {
        return <CircularProgress />;
    }

    // VisJS visualization options
    const options = {
        edges: {
            arrows: {
                to: {
                    enabled: true,
                },
            },
            color: {
                opacity: 0.6,
            },
        },
        nodes: {
            shape: "dot",
        },
        physics: {
            barnesHut: {
                springConstant: 0,
                avoidOverlap: 0.2,
            },
        },
        layout: {
            improvedLayout: false
        }
    };

    return (
        <div>
            <Graph
                key={graph.rand}
                graph={graph}
                style={{ height: "85vh" }}
                options={options}
            />
        </div>
    );
}

export default Community;
