import { NODE_RADIUS, SVG_HEIGHT, SVG_WIDTH } from "./const";
import { topologicalSort } from "./TopologicalSort";
import { Graph } from "./types";

export const randomPosition = () => {
    return {
        x: Math.random() * (SVG_WIDTH - NODE_RADIUS * 2) + NODE_RADIUS,
        y: Math.random() * (SVG_HEIGHT - NODE_RADIUS * 2) + NODE_RADIUS,
    };
}

// 与えられた順番でノードを左から優先して配置する
export const arrangeNodes = (graph : Graph) : void => {
    const sortedNodeIds = topologicalSort(graph);
    // 隣接グラフを作成
    const adjacentGraph = new Map<string, string[]>();
    graph.links.forEach(link => {
        if (!adjacentGraph.has(link.source)) {
            adjacentGraph.set(link.source, []);
        }
        adjacentGraph.get(link.source)!.push(link.target);
    });

    const level = new Map<string, number>();
    sortedNodeIds.forEach(nodeId => {
        if (!level.has(nodeId)) {
            level.set(nodeId, 0);
        }
        adjacentGraph.get(nodeId)?.forEach(target => {
            level.set(target, Math.max(level.get(target) || 0, level.get(nodeId)! + 1));
        })
    });

    // level毎の辞書
    const levelMap = new Map<number, string[]>();
    level.forEach((value, key) => {
        if (!levelMap.has(value)) {
            levelMap.set(value, []);
        }
        levelMap.get(value)!.push(key);
    });

    // ノードの配置
    levelMap.forEach((nodeIds, level) => {
        const x = (SVG_WIDTH / (levelMap.size + 1)) * (level + 1);
        const y = SVG_HEIGHT / 2;
        nodeIds.forEach((nodeId, index) => {
            const node = graph.nodes.find(node => node.id === nodeId);
            if (node) {
                node.x = x;
                node.y = y + (index - nodeIds.length / 2) * NODE_RADIUS * 2;
            }
        });
    });
}