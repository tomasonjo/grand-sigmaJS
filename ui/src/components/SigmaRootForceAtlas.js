import { React, useState, useEffect } from "react";
import { gql, useQuery } from "@apollo/client";
import CircularProgress from "@material-ui/core/CircularProgress";
import { ForceAtlasControl, SigmaContainer } from "react-sigma-v2";
import "react-sigma-v2/lib/react-sigma-v2.css";
import randomColor from "randomcolor";
import { keyBy, omit, mapValues , constant} from "lodash";


import SigmaController from "./SigmaController";
import SigmaNeighborHover from "./SigmaNeighborHover";
import GraphEventsController from "./GraphEventsController";
import ZoomButtons from "./ZoomButtons";
import TagsPanel from "./TagsPanel";

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
  const [filtersState, setFiltersState] = useState({
    tags: {},
  });

  const parseData = (data) => {
    let allNodes = new Set();
    let allColors = new Object();
    let allRels = [];
    let allCountries = new Set();

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
          tag: el.country,
        })
      );
      // add countries
      allCountries.add(el.country);

      el.outgoing_routesConnection.edges.map((refs) => {
        // add rels
        allRels.push([el.name, refs.node.name, refs.weight]);
      });
    });

    // Convert to JSON object from string
    return {
      nodes: [...allNodes].map((el) => JSON.parse(el)),
      rels: allRels,
      tags: [...allCountries].map((el) => ({ key: el })),
    };
  };

  // Construct a VisJS object based on node and rel graphql responses
  useEffect(() => {
    if (data) {
      let parsedData = parseData(data.airports);
      setDataset({
        nodes: parsedData["nodes"],
        edges: parsedData["rels"],
        tags: parsedData["tags"],
      });
      setFiltersState({
        tags: mapValues(keyBy(parsedData["tags"], "key"), constant(true)),
      });
    }
  }, [data]);

  if (loading) {
    return <CircularProgress />;
  }

  return (
    <SigmaContainer
      graphOptions={{ type: "directed" }}
      initialSettings={{
        defaultEdgeType: "arrow",
      }}
      style={{ height: "90vh", width: "100%" }}
    >
      <SigmaController dataset={dataset} geographical={false} filters={filtersState}/>
      <ForceAtlasControl autoRunFor={3000} />
      <SigmaNeighborHover hoveredNode={hoveredNode} />
      <GraphEventsController setHoveredNode={setHoveredNode} />
      {data && dataset && (
        <div>
          <div className="controls">
            <ZoomButtons />
          </div>
          <div className="panels">
            <TagsPanel
              tags={dataset.tags}
              filters={filtersState}
              setTags={(tags) =>
                setFiltersState((filters) => ({
                  ...filters,
                  tags,
                }))
              }
              toggleTag={(tag) => {
                setFiltersState((filters) => ({
                  ...filters,
                  tags: filters.tags[tag]
                    ? omit(filters.tags, tag)
                    : { ...filters.tags, [tag]: true },
                }));
              }}
            />
          </div>
        </div>
      )}
    </SigmaContainer>
  );
}

export default SigmaRootForceAtlas;
