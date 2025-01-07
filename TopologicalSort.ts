import { Graph, Node, Link } from "./types";

export const topologicalSort = (graph: Graph): string[] => {
  const inDegree: { [key: string]: number } = {};
  const adjList: { [key: string]: string[] } = {};

  graph.nodes.forEach((node) => {
    inDegree[node.id] = 0;
    adjList[node.id] = [];
  });

  graph.links.forEach((link) => {
    adjList[link.source].push(link.target);
    inDegree[link.target] = (inDegree[link.target] || 0) + 1;
  });

  const queue: string[] = [];
  Object.keys(inDegree).forEach((nodeId) => {
    if (inDegree[nodeId] === 0) {
      queue.push(nodeId);
    }
  });

  const sortedOrder: string[] = [];

  while (queue.length > 0) {
    const current = queue.shift()!;
    sortedOrder.push(current);

    adjList[current].forEach((neighbor) => {
      inDegree[neighbor]--;
      if (inDegree[neighbor] === 0) {
        queue.push(neighbor);
      }
    });
  }

  // グラフにサイクルがある場合、ソートされたノード数が足りない
  if (sortedOrder.length !== graph.nodes.length) {
    graph.nodes.forEach((node) => {
        if (!sortedOrder.includes(node.id)) {
            console.log(node.id);
        }
    });
    sortedOrder.forEach((node) => {
        if (!graph.nodes.find((n) => n.id === node)) {
            console.log(node);
        }
    });
    console.log(graph.nodes.length);
    console.log(graph.nodes);
    console.log(sortedOrder.length);
    throw new Error("グラフにサイクルが含まれています。トポロジカルソートはできません。");
  }

  return sortedOrder;
};