import { React, useState, useEffect } from "react";
import { gql, useQuery } from "@apollo/client";
import CircularProgress from "@material-ui/core/CircularProgress";
import {
    SigmaContainer,
} from "react-sigma-v2";
import SigmaController from "./SigmaController";
import SigmaNeighborHover from "./SigmaNeighborHover"
import GraphEventsController from "./GraphEventsController"
import "react-sigma-v2/lib/react-sigma-v2.css";
import { Refresh } from "@material-ui/icons";
import randomColor from 'randomcolor';



const HCP_QUERY = gql`
  query AllRoutes {
  airports {
    name
    pagerank
    fullName
    country
    latitude
    longitude
    louvain
    outgoing_routesConnection {
      edges {
        weight
        node {
          name
          pagerank
          fullName
          country
          latitude
          longitude
          louvain
        }
      }
    }
  }
  }
`;

function SigmaRootGeographical() {
    const { loading, data } = useQuery(HCP_QUERY);
    const [dataset, setDataset] = useState(null);
    const [hoveredNode, setHoveredNode] = useState(null);

    const parseNodes = (data) => {
        let allNodes = new Set()
        let allColors = new Object()
        data.map((el) => {

            if (!allColors.hasOwnProperty(el.louvain)) {
                allColors[el.louvain] = randomColor()
            }

            allNodes.add(JSON.stringify({
                key: el.name,
                label: el.name,
                size: el.pagerank,
                color: allColors[el.louvain],
                fullName: el.fullName,
                country: el.country,
                latitude: el.latitude,
                longitude: el.longitude
            }))

            el.outgoing_routesConnection.edges.map((refs) => {

                if (!allColors.hasOwnProperty(refs.node.louvain)) {
                    allColors[refs.node.louvain] = randomColor()
                }

                allNodes.add(JSON.stringify({
                    key: refs.node.name,
                    label: refs.node.name,
                    size: refs.node.pagerank,
                    color: allColors[refs.node.louvain],
                    fullName: refs.node.fullName,
                    country: refs.node.country,
                    latitude: refs.node.latitude,
                    longitude: refs.node.longitude
                }))
            })
        })

        return [...allNodes].map((el) => JSON.parse(el))
    }

    const parseRels = (data) => {
        let allRels = []
        data.map((el) => {
            el.outgoing_routesConnection.edges.map((refs) => {
                allRels.push([el.name, refs.node.name, refs.weight])
            })
        })

        return allRels
    }
    // Construct a VisJS object based on node and rel graphql responses
    useEffect(() => {
        if (data) {
            setDataset({
                nodes: parseNodes(data.airports),
                edges: parseRels(data.airports),
            });
        }
    }, [data]);

    if (loading) {
        return <CircularProgress />;
    }

    return (
        <SigmaContainer
            style={{ height: "85vh", width: "100%" }}>
            <SigmaController dataset={dataset} geographical={true} />
            <SigmaNeighborHover hoveredNode={hoveredNode} />
            <GraphEventsController setHoveredNode={setHoveredNode} />
        </SigmaContainer>
    );
}

export default SigmaRootGeographical;
