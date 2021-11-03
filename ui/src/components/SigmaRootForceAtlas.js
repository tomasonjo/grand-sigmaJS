import { React, useState, useEffect } from "react";
import { gql, useQuery } from "@apollo/client";
import CircularProgress from "@material-ui/core/CircularProgress";
import { ForceAtlasControl, SigmaContainer } from "react-sigma-v2";
import "react-sigma-v2/lib/react-sigma-v2.css";
import randomColor from "randomcolor";

import SigmaController from "./SigmaController";
import SigmaNeighborHover from "./SigmaNeighborHover";
import GraphEventsController from "./GraphEventsController";

const HCP_QUERY = gql`
  query AllRoutes {
    airports {
      name
      pagerank
      louvain
      fullName
      country
      outgoing_routesConnection {
        edges {
          weight
          node {
            name
            louvain
            pagerank
            fullName
            country
          }
        }
      }
    }
  }
`;

function SigmaRootForceAtlas() {
  const { loading, data } = useQuery(HCP_QUERY);
  const [dataset, setDataset] = useState(null);
  const [hoveredNode, setHoveredNode] = useState(null);

  const parseNodes = (data) => {
    let allNodes = new Set();
    let allColors = new Object();

    data.map((el) => {
      // define color for louvain cluster
      if (!allColors.hasOwnProperty(el.louvain)) {
        allColors[el.louvain] = randomColor();
      }

      // add nodes
      allNodes.add(
        JSON.stringify({
          key: el.name,
          label: el.name,
          size: el.pagerank,
          color: allColors[el.louvain],
          fullName: el.fullName,
          country: el.country,
        })
      );

      el.outgoing_routesConnection.edges.map((refs) => {
        if (!allColors.hasOwnProperty(refs.node.louvain)) {
          allColors[refs.node.louvain] = randomColor();
        }
        // add nodes
        allNodes.add(
          JSON.stringify({
            key: refs.node.name,
            label: refs.node.name,
            size: refs.node.pagerank,
            color: allColors[refs.node.louvain],
            fullName: refs.node.fullName,
            country: refs.node.country,
          })
        );
      });
    });

    // Convert to JSON object from string
    return [...allNodes].map((el) => JSON.parse(el));
  };

  const parseRels = (data) => {
    let allRels = [];
    data.map((el) => {
      el.outgoing_routesConnection.edges.map((refs) => {
        allRels.push([el.name, refs.node.name, refs.weight]);
      });
    });

    return allRels;
  };
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
    <SigmaContainer style={{ height: "85vh", width: "100%" }}>
      <SigmaController dataset={dataset} geographical={false} />
      <ForceAtlasControl autoRunFor={3000} />
      <SigmaNeighborHover hoveredNode={hoveredNode} />
      <GraphEventsController setHoveredNode={setHoveredNode} />
    </SigmaContainer>
  );
}

export default SigmaRootForceAtlas;
