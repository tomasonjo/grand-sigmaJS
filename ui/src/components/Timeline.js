import { React, useState, useEffect } from "react";
import { gql, useQuery } from "@apollo/client";
import CircularProgress from "@material-ui/core/CircularProgress";
import Button from '@material-ui/core/Button';
import {
  ControlsContainer,
  ForceAtlasControl,
  useSigma,
  useRegisterEvents,
  useLoadGraph,
  useSetSettings,
  SearchControl,
  SigmaContainer,
  ZoomControl,
} from "react-sigma-v2";
import SigmaController from "./SigmaController";
import "react-sigma-v2/lib/react-sigma-v2.css";



const HCP_QUERY = gql`
    query ExampleQuery {
    hcos(options: { limit: 1000, sort: { number_treating: DESC } }) {
        Name
        number_treating
        incoming_referral {
        Name
        number_treating
        }
    }
    }
`;

function Timeline() {
  const { loading: dataLoading, data: hcpData } = useQuery(HCP_QUERY);
  const [dataset, setDataset] = useState(null);

  const parseNodes = (data, isIncoming) => {
    let allNodes = new Set()
    data.map((el) => {
      allNodes.add(JSON.stringify({
        key: el.Name,
        label: el.Name
        //    size: el.referral_count,
        //    title: nodeCaption(el)
      }))
      if (isIncoming) {
        el.incoming_referral.map((refs) => {
          allNodes.add(JSON.stringify({
            key: refs.Name,
            label: refs.Name
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
          allRels.push([refs.Name, el.Name])
        })
      }
      else {

      }
    })

    return allRels
  }
  // Construct a VisJS object based on node and rel graphql responses
  useEffect(() => {
    if (hcpData) {
      setDataset({
        nodes: parseNodes(hcpData.hcos, true),
        edges: parseRels(hcpData.hcos, true),
        rand: Math.random().toString(),
      });
    }
  }, [hcpData]);

  if (dataLoading) {
    return <CircularProgress />;
  }

  return (
      <SigmaContainer style={{height:"85vh", width:"100%"}}>
      <SigmaController dataset={dataset} />
      <ForceAtlasControl autoRunFor={2000} />
      </SigmaContainer>
  );
}

export default Timeline;
