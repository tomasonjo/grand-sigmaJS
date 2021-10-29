import { useSigma, useLoadGraph } from "react-sigma-v2";
import { FC, useEffect } from "react";
import { keyBy, omit } from "lodash";
import forceAtlas2 from 'graphology-layout-forceatlas2';


const SigmaController = ({ dataset, filters }) => {
    const sigma = useSigma();
    const graph = sigma.getGraph();

    /**
     * Feed graphology with the new dataset:
     */
    useEffect(() => {
        if (!graph || !dataset) return;

        dataset.nodes.forEach((node) =>
            graph.addNode(node.key, { ...node, x: Math.random()*100, y: Math.random()*100 })//, ...omit(clusters[node.cluster], "key"), ...omit(tags[node.tag], "key") }),
        );
        dataset.edges.forEach(([source, target]) => graph.addEdge(source, target, { size: 1 }));
        /*
        // Use degrees as node sizes:
        const degrees = graph.nodes().map((node) => graph.degree(node));
        const minDegree = Math.min(...degrees);
        const maxDegree = Math.max(...degrees);
        const MIN_NODE_SIZE = 3;
        const MAX_NODE_SIZE = 30;
        graph.forEachNode((node) =>
            graph.setNodeAttribute(
                node,
                "size",
                ((graph.degree(node) - minDegree) / (maxDegree - minDegree)) * (MAX_NODE_SIZE - MIN_NODE_SIZE) + MIN_NODE_SIZE,
            ),
        );
        */
        // To directly assign the positions to the nodes:
        //const positions = forceAtlas2(graph, {iterations: 50});
        forceAtlas2.assign(graph, {iterations: 5});
       

        return null//() => graph.clear();
    }, [graph, dataset]);


    /*  * Apply filters to graphology:
   
     useEffect(() => {
       const { clusters, tags } = filters;
       graph.forEachNode((node, { cluster, tag }) =>
         graph.setNodeAttribute(node, "hidden", !clusters[cluster] || !tags[tag]),
       );
     }, [graph, filters]);
   */
    return null;
};

export default SigmaController;
