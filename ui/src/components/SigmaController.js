import { useSigma } from "react-sigma-v2";
import { useEffect } from "react";

const SigmaController = ({ dataset, geographical }) => {
  const sigma = useSigma();
  const graph = sigma.getGraph();

  /**
   * Feed graphology with the new dataset:
   */
  useEffect(() => {
    if (!graph || !dataset) return;

    if (geographical) {
      dataset.nodes.forEach((node) =>
        graph.addNode(node.key, {
          ...node,
          x: node.longitude * 100,
          y: node.latitude * 100,
        })
      );
    } else {
      dataset.nodes.forEach((node) =>
        graph.addNode(node.key, {
          ...node,
          x: Math.random() * 100,
          y: Math.random() * 100,
        })
      );
    }
    dataset.edges.forEach(([source, target, weight]) =>
      graph.addEdge(source, target, { size: weight / 10 })
    );

    return null;
  }, [graph, dataset]);

  return null;
};

export default SigmaController;
